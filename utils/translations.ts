import { Language } from '../types';

export const translations = {
  en: {
    // Mixing View
    readyStatus: "Ready to listen...",
    silenceStatus: "Silence is an ingredient too...",
    capturingStatus: "Capturing your essence...",
    distillingStatus: "Distilling your emotions...",
    errorStatus: "Connection interrupted. Try again.",
    mixProcessing: "Mixing...",
    mixButton: "Brew My Emotion",
    sliderDeep: "Deep / Negative",
    sliderBright: "Bright / Positive",
    placeholder: "How are you feeling right now? Tell me about your day, your stress, or your joy...",
    
    // Result View
    signatureBlend: "Your Signature Blend",
    moodComposition: "Mood Composition",
    intensity: "Intensity",
    sensation: "Sensation",
    saveCollection: "Save to Collection",
    mixAnother: "Mix Another",
    noDrink: "No Drink Found",

    // History View
    journeyTitle: "Your Journey",
    menuTab: "Menu",
    insightsTab: "Insights & Trends",
    emptyShelf: "The shelf is empty.",
    emptyShelfSub: "Start a session to fill your menu.",
    waveTitle: "Emotional Wave (Last 7 Days)",
    notEnoughData: "Not enough data to map your wave.",
    negative: "Negative",
    neutral: "Neutral",
    positive: "Positive",
    weeklyBreakdown: "Weekly Breakdown",
    generateReport: "Generate Report",
    analyzing: "Analyzing...",
    dominantMood: "Dominant Mood",
    recommendedTitle: "Recommended for this period",
    reportPrompt: "Tap 'Generate Report' to analyze your recent emotional trends.",
    reportNoData: "Not enough data this week to generate a report.",
    unknown: "Unknown",
    moodLabel: "Mood"
  },
  zh: {
    // Mixing View
    readyStatus: "准备倾听...",
    silenceStatus: "沉默也是一种配方...",
    capturingStatus: "正在捕捉你的情绪...",
    distillingStatus: "正在提炼情感...",
    errorStatus: "连接中断，请重试。",
    mixProcessing: "调制中...",
    mixButton: "调配我的情绪",
    sliderDeep: "低沉 / 负面",
    sliderBright: "明亮 / 正面",
    placeholder: "此刻感觉如何？告诉我你的一天，你的压力，或是你的快乐...",
    
    // Result View
    signatureBlend: "你的专属特调",
    moodComposition: "情绪成分",
    intensity: "烈度",
    sensation: "口感 / 体感",
    saveCollection: "收藏至酒单",
    mixAnother: "再来一杯",
    noDrink: "未找到饮品",

    // History View
    journeyTitle: "情感旅程",
    menuTab: "酒单",
    insightsTab: "洞察与趋势",
    emptyShelf: "酒架空空如也。",
    emptyShelfSub: "开始一次会话来丰富你的菜单。",
    waveTitle: "情绪波动 (近7天)",
    notEnoughData: "数据不足，无法绘制波动图。",
    negative: "消极",
    neutral: "平稳",
    positive: "积极",
    weeklyBreakdown: "周度分析",
    generateReport: "生成报告",
    analyzing: "分析中...",
    dominantMood: "主导情绪",
    recommendedTitle: "本周期推荐饮品",
    reportPrompt: "点击“生成报告”以分析你近期的情绪趋势。",
    reportNoData: "本周数据不足，无法生成报告。",
    unknown: "未知",
    moodLabel: "情绪值"
  }
};

export const getTranslation = (lang: Language) => translations[lang];