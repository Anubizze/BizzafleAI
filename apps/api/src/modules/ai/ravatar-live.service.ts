import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../../common/logger/logger';

const DEFAULT_BASE = 'https://chat.rvtr.ai';

interface JwtResponse {
  result?: string;
  jwt?: string;
}

interface AvatarInfo {
  _id?: string;
  name?: string;
  hasLiveMode?: boolean;
  idleVideo?: string;
  previewIcons?: { large?: string; medium?: string; small?: string };
}

interface ConnectionResponse {
  status?: number;
  session?: string;
  avatars_info?: AvatarInfo[];
}

interface LiveSessionResponse {
  status?: number;
  LicenseId?: string;
  streamingUrl?: string;
  error?: string;
}

export type RavatarLiveSession = {
  provider: 'ravatar';
  name: string;
  language: string;
  token: string;
  avatarId: string;
  streamingUrl: string;
  wsUrl: string;
  licenseId: string;
  userId: string;
  session?: string;
  previewUrl?: string;
};

@Injectable()
export class RavatarLiveService {
  private readonly logger = new AppLogger('Ravatar');

  constructor(private readonly config: ConfigService) {}

  configured(): boolean {
    return Boolean(this.projectId());
  }

  private base() {
    return (this.config.get<string>('RAVATAR_API_URL') || DEFAULT_BASE).replace(/\/$/, '');
  }

  private projectId() {
    return (
      this.config.get<string>('RAVATAR_PROJECT_ID')?.trim() ||
      this.config.get<string>('RAVATAR_API_KEY')?.trim() ||
      ''
    );
  }

  async createLiveSession(userId = 'bizaffle-demo'): Promise<RavatarLiveSession> {
    if (!this.configured()) {
      throw new ServiceUnavailableException('RAVATAR_PROJECT_ID не задан');
    }

    const token = await this.jwt(userId);
    const connection = await this.connection(token);
    const avatar = this.pickAvatar(connection.avatars_info ?? []);
    if (!avatar?._id) {
      throw new ServiceUnavailableException('В проекте Ravatar нет аватара');
    }

    const live = await this.startLive(token, avatar._id);
    if (!live.LicenseId || !live.streamingUrl) {
      throw new ServiceUnavailableException(live.error || 'Ravatar Live Mode недоступен');
    }

    const sep = live.streamingUrl.includes('?') ? '&' : '?';
    const streamingUrl = `${live.streamingUrl}${sep}token=${encodeURIComponent(token)}`;

    return {
      provider: 'ravatar',
      name: avatar.name || 'Айдана',
      language: 'ru',
      token,
      avatarId: avatar._id,
      streamingUrl,
      wsUrl: `${this.base().replace(/^http/, 'ws')}/ws/chat?token=${encodeURIComponent(token)}`,
      licenseId: live.LicenseId,
      userId,
      session: connection.session,
      previewUrl: avatar.previewIcons?.large || avatar.idleVideo,
    };
  }

  private async jwt(userId: string) {
    const response = await fetch(`${this.base()}/jwt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ user_id: userId, project_id: this.projectId() }),
    });
    const payload = (await response.json().catch(() => ({}))) as JwtResponse;
    if (!response.ok || !payload.jwt) {
      this.logger.warn({ msg: 'ravatar_jwt_failed', status: response.status });
      throw new ServiceUnavailableException('Не удалось получить JWT Ravatar. Проверьте project_id.');
    }
    return payload.jwt;
  }

  private async connection(token: string) {
    const response = await fetch(`${this.base()}/connection`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    const payload = (await response.json().catch(() => ({}))) as ConnectionResponse;
    if (!response.ok) {
      throw new ServiceUnavailableException('Ravatar /connection недоступен');
    }
    return payload;
  }

  private pickAvatar(avatars: AvatarInfo[]) {
    const requested = this.config.get<string>('RAVATAR_AVATAR_ID')?.trim();
    if (requested) return avatars.find((item) => item._id === requested) ?? avatars[0];
    return (
      avatars.find((item) => item.hasLiveMode) ??
      avatars.find((item) => /aidana|айл|жен|woman|female/i.test(item.name || '')) ??
      avatars[0]
    );
  }

  private async startLive(token: string, avatarId: string) {
    const response = await fetch(`${this.base()}/startLiveSession`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ avatar_id: avatarId, width: '720', height: '1280' }),
    });
    return ((await response.json().catch(() => ({}))) as LiveSessionResponse) ?? {};
  }
}
