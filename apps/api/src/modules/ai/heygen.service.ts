import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../../common/logger/logger';

const HEYGEN_BASE = 'https://api.heygen.com';
const PUBLIC_AVATAR = 'Ann_Therapist_public';

interface HeygenTokenResponse {
  data?: { token?: string };
  token?: string;
  error?: { message?: string; msg?: string } | string | null;
  message?: string;
  msg?: string;
}

interface HeygenAvatar {
  avatar_id?: string;
  avatar_name?: string;
}

@Injectable()
export class HeygenService {
  private readonly logger = new AppLogger('Heygen');

  constructor(private readonly config: ConfigService) {}

  configured(): boolean {
    return Boolean(this.config.get<string>('HEYGEN_API_KEY'));
  }

  avatarId(): string {
    const id = this.config.get<string>('HEYGEN_AVATAR_ID')?.trim();
    if (!id || id === 'default') return PUBLIC_AVATAR;
    return id;
  }

  async createClientSession() {
    const token = await this.createToken();
    const requested = this.avatarId();
    const resolved = await this.resolveAvatarId(requested);
    return {
      token,
      avatarId: resolved,
      language: 'ru',
      name: 'Айдана',
    };
  }

  private async createToken(): Promise<string> {
    const apiKey = this.config.get<string>('HEYGEN_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('HEYGEN_API_KEY не задан');
    }

    const attempts: Array<{ url: string; init: RequestInit }> = [
      {
        url: `${HEYGEN_BASE}/v1/streaming.create_token`,
        init: {
          method: 'POST',
          headers: { 'x-api-key': apiKey, Accept: 'application/json' },
        },
      },
      {
        url: `${HEYGEN_BASE}/v1/streaming.create_token`,
        init: {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        },
      },
    ];

    let lastStatus = 0;
    let lastMessage = '';

    for (const attempt of attempts) {
      const response = await fetch(attempt.url, attempt.init);
      const raw = await response.text();
      let payload: HeygenTokenResponse = {};
      try {
        payload = raw ? (JSON.parse(raw) as HeygenTokenResponse) : {};
      } catch {
        payload = {};
      }
      const token = payload.data?.token ?? payload.token;
      if (response.ok && token) return token;
      lastStatus = response.status;
      lastMessage = this.readMessage(payload) || raw.slice(0, 180);
      this.logger.warn({
        msg: 'heygen_token_failed',
        status: response.status,
        detail: lastMessage.slice(0, 180),
      });
      if (response.status !== 404) break;
    }

    throw new ServiceUnavailableException(this.userMessage(lastStatus, lastMessage));
  }

  private readMessage(payload: HeygenTokenResponse) {
    if (typeof payload.error === 'string') return payload.error;
    return (
      payload.error?.message ||
      payload.error?.msg ||
      payload.message ||
      payload.msg ||
      ''
    );
  }

  private userMessage(status: number, detail: string) {
    if (status === 401 || status === 403 || /invalid api|unauthorized|forbidden/i.test(detail)) {
      return 'HeyGen отклонил ключ. Вставьте актуальный HEYGEN_API_KEY с тарифом Interactive Avatar.';
    }
    if (status === 404) {
      return 'HeyGen не открыл streaming-сессию (404). Нужен ключ Interactive Avatar, не обычный Video API.';
    }
    return (
      detail ||
      'Не удалось открыть сессию аватара HeyGen. Нужен тариф Streaming / Interactive Avatar и корректный Avatar ID.'
    );
  }

  private async resolveAvatarId(requested: string): Promise<string> {
    if (requested && requested !== 'default') {
      return requested;
    }
    const listed = await this.listAvatarIds();
    const preferred =
      listed.find((id) => /ann|elena|susan|sofia|anna|june|woman|female/i.test(id)) ?? listed[0];
    return preferred || PUBLIC_AVATAR;
  }

  private async listAvatarIds(): Promise<string[]> {
    const apiKey = this.config.get<string>('HEYGEN_API_KEY');
    if (!apiKey) return [];
    const urls = [`${HEYGEN_BASE}/v1/streaming/avatar.list`, `${HEYGEN_BASE}/v2/avatars`];
    for (const url of urls) {
      try {
        const response = await fetch(url, {
          headers: { 'x-api-key': apiKey, Accept: 'application/json' },
        });
        if (!response.ok) continue;
        const payload = (await response.json()) as {
          data?: { avatars?: HeygenAvatar[] } | HeygenAvatar[];
        };
        const rows = Array.isArray(payload.data) ? payload.data : payload.data?.avatars ?? [];
        const ids = rows
          .map((item) => item.avatar_id || item.avatar_name)
          .filter((id): id is string => Boolean(id));
        if (ids.length) return ids;
      } catch {
        /* try next */
      }
    }
    return [];
  }
}
