export type Locale = "ru" | "kk" | "en";

export const defaultLocale: Locale = "ru";

export const localeLabels: Record<Locale, string> = {
  ru: "Русский",
  kk: "Қазақша",
  en: "English",
};

type Dict = Record<string, string>;

export const ru: Dict = {
  "nav.product": "Продукт",
  "nav.features": "Возможности",
  "nav.team": "AI-команда",
  "nav.business": "Для бизнеса",
  "nav.pricing": "Тарифы",
  "nav.faq": "FAQ",
  "nav.login": "Войти",
  "nav.start": "Начать бесплатно",

  "hero.title": "Ваша AI-команда для бизнеса",
  "hero.subtitle":
    "Бухгалтер, юрист и бизнес-консультант в одном сервисе. Bizaffle AI помогает предпринимателям принимать решения, работать с документами и контролировать бизнес.",
  "hero.cta": "Попробовать бесплатно",
  "hero.secondary": "Посмотреть возможности",
  "hero.disclaimer":
    "Bizaffle AI помогает ориентироваться в вопросах, но не заменяет лицензированного бухгалтера, юриста или аудитора.",

  "auth.login.title": "С возвращением",
  "auth.login.subtitle": "Войдите, чтобы продолжить работу с командой.",
  "auth.login.submit": "Войти",
  "auth.register.title": "Начните бесплатно",
  "auth.register.subtitle": "Соберите AI-команду за пару минут.",
  "auth.register.submit": "Создать аккаунт",
  "auth.forgot.title": "Сброс пароля",
  "auth.forgot.subtitle": "Отправим ссылку на почту, если аккаунт существует.",
  "auth.forgot.submit": "Отправить ссылку",
  "auth.email": "Email",
  "auth.password": "Пароль",
  "auth.name": "Имя",
  "auth.phone": "Телефон",
  "auth.demo": "Демо: demo@bizaffle.ai / Demo1234!",

  "common.loading": "Загрузка…",
  "common.retry": "Повторить",
  "common.save": "Сохранить",
  "common.cancel": "Отмена",
  "common.back": "Назад",
  "common.next": "Далее",
  "common.search": "Поиск",
  "common.empty": "Пока здесь пусто",
  "common.error": "Не удалось загрузить данные",
};

export const kk: Dict = {
  "nav.product": "Өнім",
  "nav.features": "Мүмкіндіктер",
  "nav.team": "AI-команда",
  "nav.business": "Бизнеске",
  "nav.pricing": "Тарифтер",
  "nav.faq": "FAQ",
  "nav.login": "Кіру",
  "nav.start": "Тегін бастау",
  "hero.title": "Бизнеске арналған AI-командаңыз",
  "hero.subtitle":
    "Бухгалтер, заңгер және бизнес-кеңесші — бір терезеде. Қазақстандағы ЖК мен ЖШС үшін салық, шарттар және стратегия.",
  "hero.cta": "Тегін байқап көру",
  "hero.secondary": "Мүмкіндіктерді қарау",
  "auth.login.title": "Қайта қош келдіңіз",
  "auth.login.submit": "Кіру",
  "auth.register.title": "Тегін бастаңыз",
  "auth.register.submit": "Аккаунт ашу",
  "auth.forgot.title": "Құпиясөзді қалпына келтіру",
  "auth.email": "Email",
  "auth.password": "Құпиясөз",
  "auth.name": "Аты",
  "auth.phone": "Телефон",
};

export const en: Dict = {
  "nav.product": "Product",
  "nav.features": "Features",
  "nav.team": "AI team",
  "nav.business": "For business",
  "nav.pricing": "Pricing",
  "nav.faq": "FAQ",
  "nav.login": "Sign in",
  "nav.start": "Start free",
  "hero.title": "Your AI team for business",
  "hero.subtitle":
    "An accountant, a lawyer and a business consultant in one workspace. Taxes, contracts and strategy for Kazakhstan sole props and LLPs.",
  "hero.cta": "Try for free",
  "hero.secondary": "See capabilities",
  "auth.login.title": "Welcome back",
  "auth.login.submit": "Sign in",
  "auth.register.title": "Start free",
  "auth.register.submit": "Create account",
  "auth.forgot.title": "Reset password",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.name": "Name",
  "auth.phone": "Phone",
  "auth.demo": "Demo: demo@bizaffle.ai / Demo1234!",
};

export const dictionaries: Record<Locale, Dict> = { ru, kk, en };
