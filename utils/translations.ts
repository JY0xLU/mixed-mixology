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
    placeholder: "How are you feeling? Type or speak...",
    
    // Controls
    labelEnergy: "Energy",
    labelMood: "Mood",
    micStart: "Tap to Speak",
    micListening: "Listening...",
    
    // Result View
    signatureBlend: "Your Signature Blend",
    moodComposition: "Mood Composition",
    intensity: "Intensity",
    sensation: "Sensation",
    saveCollection: "Save to Collection",
    mixAnother: "Mix Another",
    noDrink: "No Drink Found",
    
    // Result View - New Features
    tabAbstract: "The Metaphor",
    tabReal: "The Recipe",
    ingredients: "Ingredients",
    instructions: "Preparation",
    sonicVibe: "Sonic Seasoning",
    playAmbience: "Play Ambience",
    stopAmbience: "Stop",
    
    // Emergency & Share
    copingBtn: "Breathe with me",
    shareBtn: "Share Card",
    shareTitle: "Mood Card",
    shareSubtitle: "Capture this moment",
    inhale: "Inhale",
    hold: "Hold",
    exhale: "Exhale",
    close: "Close",

    // History View
    journeyTitle: "Your Journey",
    menuTab: "Menu",
    insightsTab: "Insights & Trends",
    emptyShelf: "The shelf is empty.",
    emptyShelfSub: "Start a session to fill your menu.",
    waveTitle: "Emotional Rhythm (Last 7 Days)",
    notEnoughData: "Not enough data to map your rhythm.",
    negative: "Deep",
    neutral: "Balanced",
    positive: "Radiant",
    weeklyBreakdown: "Weekly Insight",
    generateReport: "Generate Insight",
    analyzing: "Connecting dots...",
    dominantMood: "Theme",
    recommendedTitle: "Recommended for Balance",
    reportPrompt: "Tap to generate a therapeutic insight of your recent journey.",
    reportNoData: "Not enough data this week to generate insight.",
    unknown: "Unknown",
    moodLabel: "Mood",

    // History View - New Views
    viewList: "List",
    viewCalendar: "Calendar",
    viewShelf: "Shelf",
    viewCellar: "The Cellar"
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
    sliderDeep: "低沉",
    sliderBright: "明亮",
    placeholder: "感觉如何？打字或语音输入...",
    
    // Controls
    labelEnergy: "能量值",
    labelMood: "愉悦度",
    micStart: "点击说话",
    micListening: "正在聆听...",
    
    // Result View
    signatureBlend: "你的专属特调",
    moodComposition: "情绪成分",
    intensity: "烈度",
    sensation: "口感 / 体感",
    saveCollection: "收藏至酒单",
    mixAnother: "再来一杯",
    noDrink: "未找到饮品",

    // Result View - New Features
    tabAbstract: "意象配方",
    tabReal: "现实特调",
    ingredients: "配料",
    instructions: "制作步骤",
    sonicVibe: "听觉佐料",
    playAmbience: "播放氛围",
    stopAmbience: "停止",

    // Emergency & Share
    copingBtn: "跟我深呼吸",
    shareBtn: "分享卡片",
    shareTitle: "情绪卡片",
    shareSubtitle: "定格此刻",
    inhale: "吸气",
    hold: "屏气",
    exhale: "呼气",
    close: "关闭",

    // History View
    journeyTitle: "情感旅程",
    menuTab: "酒单",
    insightsTab: "洞察与趋势",
    emptyShelf: "酒架空空如也。",
    emptyShelfSub: "开始一次会话来丰富你的菜单。",
    waveTitle: "情绪韵律 (近7天)",
    notEnoughData: "数据不足，无法绘制韵律。",
    negative: "深沉",
    neutral: "平稳",
    positive: "明亮",
    weeklyBreakdown: "周度心语",
    generateReport: "生成心语",
    analyzing: "连接思绪...",
    dominantMood: "主旋律",
    recommendedTitle: "本周治愈特调",
    reportPrompt: "点击生成，查收你近期的情感解读。",
    reportNoData: "本周数据不足，无法生成解读。",
    unknown: "未知",
    moodLabel: "情绪值",

    // History View - New Views
    viewList: "列表",
    viewCalendar: "日历",
    viewShelf: "酒架",
    viewCellar: "私人酒窖"
  }
};

export const getTranslation = (lang: Language) => translations[lang];