export const translations = {
  en: {
    nav: {
      overview: "Overview",
      datasets: "Datasets",
      analytics: "Analytics",
      insights: "AI Insights",
      predictions: "Predictions",
      quality: "Data Quality",
      cleaning: "Data Cleaning",
      reports: "Reports",
      executive: "Executive Mode",
      analyst: "Analyst Mode",
      correlations: "Correlations",
      story: "Data Story",
      demo: "Interactive Demo",
      settings: "Settings",
    },
    dashboard: {
      title: "Dashboard",
      subtitle: "Executive snapshot of your dataset",
    },
    common: {
      loading: "Loading...",
      error: "An error occurred",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      next: "Next",
      previous: "Previous",
      skip: "Skip",
    },
  },
  ar: {
    nav: {
      overview: "نظرة عامة",
      datasets: "مجموعات البيانات",
      analytics: "التحليلات",
      insights: "رؤى الذكاء الاصطناعي",
      predictions: "التنبؤات",
      quality: "جودة البيانات",
      cleaning: "تنظيف البيانات",
      reports: "التقارير",
      executive: "وضع المديرين",
      analyst: "وضع المحللين",
      correlations: "الارتباطات",
      story: "قصة البيانات",
      demo: "العرض التوضيحي التفاعلي",
      settings: "الإعدادات",
    },
    dashboard: {
      title: "لوحة المعلومات",
      subtitle: "لمحة سريعة عن مجموعة البيانات الخاصة بك",
    },
    common: {
      loading: "جاري التحميل...",
      error: "حدث خطأ ما",
      success: "نجح",
      cancel: "إلغاء",
      save: "حفظ",
      delete: "حذف",
      edit: "تحرير",
      next: "التالي",
      previous: "السابق",
      skip: "تخطي",
    },
  },
} as const;

export type Language = keyof typeof translations;

export function getTranslation(lang: Language, key: string): string {
  const parts = key.split(".");
  let value: any = translations[lang];

  for (const part of parts) {
    value = value?.[part];
  }

  return value || key;
}
