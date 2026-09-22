/**
 * English / Sinhala strings for the whole app.
 *
 * Validators return keys from the `errors` block rather than sentences, so an
 * error raised while the form is in English still renders correctly after the
 * user switches to Sinhala.
 */

export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'si', label: 'සිංහල', short: 'සිං' },
]

// Stored in the sheet in English regardless of the UI language, so the data
// stays consistent and sortable.
export const VISITOR_CATEGORIES = ['Student', 'SME', 'Industry', 'Other']
export const INTEREST_AREAS = [
  'Sustainability',
  'Digital Transformation',
  'Innovation',
  'Entrepreneurship',
]

export const translations = {
  en: {
    appName: 'ACEL',
    appNameSuffix: 'Registration',
    nav: { register: 'Register', dashboard: 'Dashboard' },

    register: {
      badge: 'Registrations are open',
      title: 'Registration Form',
      subtitle: 'Fill in your details below. Everything is saved straight into our Google Sheet.',
      submit: 'Submit',
      submitting: 'Submitting...',
      success: 'Registration submitted successfully.',
      fixErrors: 'Please fix the highlighted fields before submitting.',
      dashboardPrompt: 'Managing registrations?',
      dashboardLink: 'Open the dashboard',
      optional: 'optional',
    },

    fields: {
      fullName: 'Full Name',
      firstName: 'First Name',
      lastName: 'Last Name',
      nic: 'NIC Number',
      nicHint: 'Old format 123456789V or new format 200012345678',
      email: 'Email Address',
      emailHint: 'example@example.com',
      mobile: 'Mobile Number',
      mobileHint: 'Please enter a valid phone number.',
      organization: 'Organization',
      visitorCategory: 'Visitor Category',
      interestArea: 'Interest Area',
      interestAreaHint: 'Select all that apply',
      heardFrom: 'How did you hear about this event?',
      consent: 'I consent to receive future communications about similar events.',
    },

    categories: {
      Student: 'Student',
      SME: 'SME',
      Industry: 'Industry',
      Other: 'Other',
    },

    interests: {
      Sustainability: 'Sustainability',
      'Digital Transformation': 'Digital Transformation',
      Innovation: 'Innovation',
      Entrepreneurship: 'Entrepreneurship',
    },

    charts: {
      visitorsTitle: 'No. of visitors',
      visitorsHint: 'Total registered so far',
      todaySuffix: 'registered today',
      visitorTypeTitle: 'Visitor type',
      visitorTypeHint: 'Click a bar to filter the table below',
      interestTitle: 'Field of interest',
      interestHint: 'Share of all selections - visitors may pick more than one',
      clearFilter: 'Clear',
      noData: 'No data yet',
      filteredNotice: 'Table filtered by',
    },

    dashboard: {
      title: 'Dashboard',
      subtitle: 'View, update and remove registration records.',
      refresh: 'Refresh',
      totalLabel: 'Total registrations',
      totalHint: 'All records in the sheet',
      todayLabel: 'Registered today',
      todayHint: 'Submitted in the last 24 hours',
      showingLabel: 'Showing',
      noFilter: 'No filter applied',
      filteredBy: 'Filtered by',
      searchPlaceholder: 'Search name, NIC or phone',
      searchLabel: 'Search records',
      sortBy: 'Sort by',
      sortLatest: 'Latest records',
      sortOldest: 'Oldest records',
      sortNameAsc: 'Name (A-Z)',
      sortNameDesc: 'Name (Z-A)',
      sortCategory: 'Visitor category',
      sortCreated: 'Created date (newest)',
      updateTitle: 'Update record',
      editingRecord: 'Editing record',
      cancel: 'Cancel',
      save: 'Save changes',
      saving: 'Saving...',
      updated: 'Record updated successfully.',
      deleteTitle: 'Delete record',
      deleteButton: 'Delete record',
      deleting: 'Deleting...',
      deleted: 'Record deleted successfully.',
      deleteWarningBefore: 'This permanently removes',
      deleteWarningAfter: 'from the Google Sheet. This action cannot be undone.',
    },

    table: {
      id: 'ID',
      name: 'Name',
      nic: 'NIC',
      email: 'Email',
      mobile: 'Phone Number',
      organization: 'Organization',
      category: 'Category',
      interests: 'Interest Areas',
      heardFrom: 'Heard From',
      consent: 'Consent',
      createdDate: 'Created Date',
      createdTime: 'Created Time',
      lastUpdated: 'Last Updated',
      actions: 'Actions',
      update: 'Update',
      delete: 'Delete',
      yes: 'Yes',
      no: 'No',
    },

    states: {
      loading: 'Loading records...',
      errorTitle: 'Could not load records',
      retry: 'Try again',
      emptyTitle: 'No registrations yet',
      emptyBody: 'New submissions from the registration form will appear here.',
      noMatchTitle: 'No matching records',
      noMatchBody: 'Try a different name, NIC or phone number.',
      dismiss: 'Dismiss notification',
      close: 'Close dialog',
    },

    errors: {
      required: 'This field is required',
      firstNameRequired: 'First name is required',
      lastNameRequired: 'Last name is required',
      nameTooShort: 'Must be at least 2 characters',
      nameTooLong: 'Must be under 40 characters',
      nameInvalid: 'Only letters, spaces, hyphens and apostrophes are allowed',
      nicRequired: 'NIC number is required',
      nicInvalid: 'Enter a valid NIC (123456789V or 200012345678)',
      emailInvalid: 'Enter a valid email address',
      phoneRequired: 'Mobile number is required',
      phoneInvalid: 'Enter a valid Sri Lankan number (e.g. 0771234567)',
      organizationTooLong: 'Must be under 80 characters',
      categoryRequired: 'Please select a visitor category',
      interestRequired: 'Select at least one interest area',
      heardFromTooLong: 'Must be under 120 characters',
    },

    footer: 'ACEL Registration System - React + Google Apps Script + Google Sheets',
  },

  si: {
    appName: 'ACEL',
    appNameSuffix: 'ලියාපදිංචිය',
    nav: { register: 'ලියාපදිංචි වන්න', dashboard: 'උපකරණ පුවරුව' },

    register: {
      badge: 'ලියාපදිංචිය විවෘතයි',
      title: 'ලියාපදිංචි ආකෘති පත්‍රය',
      subtitle: 'ඔබේ විස්තර පහතින් ඇතුළත් කරන්න. සියලු තොරතුරු කෙලින්ම Google Sheet එකට සුරැකේ.',
      submit: 'යොමු කරන්න',
      submitting: 'යොමු කරමින්...',
      success: 'ලියාපදිංචිය සාර්ථකව යොමු කරන ලදී.',
      fixErrors: 'යොමු කිරීමට පෙර ඉස්මතු කර ඇති ක්ෂේත්‍ර නිවැරදි කරන්න.',
      dashboardPrompt: 'ලියාපදිංචි කළමනාකරණය කරනවාද?',
      dashboardLink: 'උපකරණ පුවරුව විවෘත කරන්න',
      optional: 'අනිවාර්ය නොවේ',
    },

    fields: {
      fullName: 'සම්පූර්ණ නම',
      firstName: 'මුල් නම',
      lastName: 'අවසන් නම',
      nic: 'ජාතික හැඳුනුම්පත් අංකය',
      nicHint: 'පැරණි ආකෘතිය 123456789V හෝ නව ආකෘතිය 200012345678',
      email: 'ඊමේල් ලිපිනය',
      emailHint: 'example@example.com',
      mobile: 'ජංගම දුරකථන අංකය',
      mobileHint: 'කරුණාකර වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න.',
      organization: 'සංවිධානය',
      visitorCategory: 'අමුත්තාගේ කාණ්ඩය',
      interestArea: 'උනන්දුව දක්වන ක්ෂේත්‍රය',
      interestAreaHint: 'අදාළ සියල්ල තෝරන්න',
      heardFrom: 'මෙම උත්සවය ගැන ඔබ දැනගත්තේ කෙසේද?',
      consent: 'සමාන උත්සව පිළිබඳ අනාගත සන්නිවේදන ලබා ගැනීමට මම එකඟ වෙමි.',
    },

    categories: {
      Student: 'ශිෂ්‍ය',
      SME: 'කුඩා හා මධ්‍ය පරිමාණ ව්‍යාපාර',
      Industry: 'කර්මාන්ත',
      Other: 'වෙනත්',
    },

    interests: {
      Sustainability: 'තිරසාරත්වය',
      'Digital Transformation': 'ඩිජිටල් පරිවර්තනය',
      Innovation: 'නව්‍යකරණය',
      Entrepreneurship: 'ව්‍යවසායකත්වය',
    },

    charts: {
      visitorsTitle: 'අමුත්තන් සංඛ්‍යාව',
      visitorsHint: 'මේ දක්වා ලියාපදිංචි වූ මුළු සංඛ්‍යාව',
      todaySuffix: 'අද ලියාපදිංචි විය',
      visitorTypeTitle: 'අමුත්තාගේ වර්ගය',
      visitorTypeHint: 'පහත වගුව පෙරීමට තීරුවක් ක්ලික් කරන්න',
      interestTitle: 'උනන්දුව දක්වන ක්ෂේත්‍රය',
      interestHint: 'සියලු තේරීම්වලින් කොටස - අමුත්තන්ට එකකට වඩා තෝරාගත හැක',
      clearFilter: 'ඉවත් කරන්න',
      noData: 'තවම දත්ත නැත',
      filteredNotice: 'වගුව පෙරා ඇත්තේ',
    },

    dashboard: {
      title: 'උපකරණ පුවරුව',
      subtitle: 'ලියාපදිංචි වාර්තා බලන්න, යාවත්කාලීන කරන්න සහ ඉවත් කරන්න.',
      refresh: 'නැවුම් කරන්න',
      totalLabel: 'මුළු ලියාපදිංචි සංඛ්‍යාව',
      totalHint: 'පත්‍රයේ ඇති සියලු වාර්තා',
      todayLabel: 'අද ලියාපදිංචි වූ',
      todayHint: 'පැය 24 තුළ යොමු කරන ලද',
      showingLabel: 'පෙන්වන්නේ',
      noFilter: 'පෙරහනක් යොදා නැත',
      filteredBy: 'පෙරහන',
      searchPlaceholder: 'නම, හැඳුනුම්පත හෝ දුරකථනය සොයන්න',
      searchLabel: 'වාර්තා සොයන්න',
      sortBy: 'අනුපිළිවෙල',
      sortLatest: 'නවතම වාර්තා',
      sortOldest: 'පැරණිතම වාර්තා',
      sortNameAsc: 'නම (අ-ෆ)',
      sortNameDesc: 'නම (ෆ-අ)',
      sortCategory: 'අමුත්තාගේ කාණ්ඩය',
      sortCreated: 'නිර්මාණය කළ දිනය (නවතම)',
      updateTitle: 'වාර්තාව යාවත්කාලීන කරන්න',
      editingRecord: 'සංස්කරණය කරන වාර්තාව',
      cancel: 'අවලංගු කරන්න',
      save: 'වෙනස්කම් සුරකින්න',
      saving: 'සුරකිමින්...',
      updated: 'වාර්තාව සාර්ථකව යාවත්කාලීන කරන ලදී.',
      deleteTitle: 'වාර්තාව මකන්න',
      deleteButton: 'වාර්තාව මකන්න',
      deleting: 'මකමින්...',
      deleted: 'වාර්තාව සාර්ථකව මකා දමන ලදී.',
      deleteWarningBefore: 'මෙය ස්ථිරවම ඉවත් කරයි',
      deleteWarningAfter: 'Google Sheet එකෙන්. මෙම ක්‍රියාව අහෝසි කළ නොහැක.',
    },

    table: {
      id: 'අංකය',
      name: 'නම',
      nic: 'හැඳුනුම්පත',
      email: 'ඊමේල්',
      mobile: 'දුරකථන අංකය',
      organization: 'සංවිධානය',
      category: 'කාණ්ඩය',
      interests: 'උනන්දුව දක්වන ක්ෂේත්‍ර',
      heardFrom: 'දැනගත්තේ',
      consent: 'එකඟතාව',
      createdDate: 'නිර්මාණය කළ දිනය',
      createdTime: 'නිර්මාණය කළ වේලාව',
      lastUpdated: 'අවසන් යාවත්කාලීනය',
      actions: 'ක්‍රියා',
      update: 'යාවත්කාලීන',
      delete: 'මකන්න',
      yes: 'ඔව්',
      no: 'නැත',
    },

    states: {
      loading: 'වාර්තා පූරණය වෙමින්...',
      errorTitle: 'වාර්තා පූරණය කළ නොහැකි විය',
      retry: 'නැවත උත්සාහ කරන්න',
      emptyTitle: 'තවම ලියාපදිංචි වී නැත',
      emptyBody: 'ලියාපදිංචි පත්‍රයෙන් එන නව යෙදවුම් මෙහි දිස්වනු ඇත.',
      noMatchTitle: 'ගැලපෙන වාර්තා නැත',
      noMatchBody: 'වෙනත් නමක්, හැඳුනුම්පතක් හෝ දුරකථන අංකයක් උත්සාහ කරන්න.',
      dismiss: 'දැනුම්දීම ඉවත් කරන්න',
      close: 'සංවාදය වසන්න',
    },

    errors: {
      required: 'මෙම ක්ෂේත්‍රය අනිවාර්ය වේ',
      firstNameRequired: 'මුල් නම අනිවාර්ය වේ',
      lastNameRequired: 'අවසන් නම අනිවාර්ය වේ',
      nameTooShort: 'අවම වශයෙන් අක්ෂර 2ක් විය යුතුය',
      nameTooLong: 'අක්ෂර 40ට වඩා අඩු විය යුතුය',
      nameInvalid: 'අකුරු, හිස්තැන් සහ එකතු කිරීමේ ලකුණු පමණක් අවසර ඇත',
      nicRequired: 'ජාතික හැඳුනුම්පත් අංකය අනිවාර්ය වේ',
      nicInvalid: 'වලංගු හැඳුනුම්පත් අංකයක් ඇතුළත් කරන්න (123456789V හෝ 200012345678)',
      emailInvalid: 'වලංගු ඊමේල් ලිපිනයක් ඇතුළත් කරන්න',
      phoneRequired: 'ජංගම දුරකථන අංකය අනිවාර්ය වේ',
      phoneInvalid: 'වලංගු ශ්‍රී ලාංකික අංකයක් ඇතුළත් කරන්න (උදා: 0771234567)',
      organizationTooLong: 'අක්ෂර 80ට වඩා අඩු විය යුතුය',
      categoryRequired: 'කරුණාකර අමුත්තාගේ කාණ්ඩය තෝරන්න',
      interestRequired: 'අවම වශයෙන් එක් ක්ෂේත්‍රයක් තෝරන්න',
      heardFromTooLong: 'අක්ෂර 120ට වඩා අඩු විය යුතුය',
    },

    footer: 'ACEL ලියාපදිංචි පද්ධතිය - React + Google Apps Script + Google Sheets',
  },
}

/** Resolve a dotted key path, falling back to English and then the key itself. */
export function lookup(language, path) {
  const walk = (dictionary) =>
    path.split('.').reduce((value, part) => (value == null ? undefined : value[part]), dictionary)

  const value = walk(translations[language]) ?? walk(translations.en)
  return value === undefined ? path : value
}
