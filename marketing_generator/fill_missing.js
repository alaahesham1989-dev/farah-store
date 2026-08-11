const fs = require('fs');
const axios = require('axios');
const ExcelJS = require('exceljs');

const GROQ_API_KEY = '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';
const GROQ_MODEL = 'llama-3.3-70b-versatile'; 

const FILE_PATH = 'C:\\Users\\FOX\\Desktop\\فرح لستور\\Marketing_Master.xlsx';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateGroqContent(prompt) {
    let retries = 5;
    while (retries > 0) {
        try {
            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: GROQ_MODEL,
                    messages: [
                        { role: 'system', content: "أنت خبير تسويق إلكتروني محترف للسوق المصري." },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 800
                },
                {
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.choices[0].message.content.trim();
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.log(`Rate limit hit! Waiting 20 seconds...`);
                await delay(20000);
                retries--;
            } else {
                console.error(`Groq API Error:`, error.message);
                await delay(5000);
                retries--;
            }
        }
    }
    return "فشل في توليد المحتوى بسبب خطأ في الخادم (API Error).";
}

const promptTemplates = {
    5: `بناءً على المنتج التالي، حدد "الجمهور المستهدف" بالتفصيل (العمر، الاهتمامات، المشاكل التي يعانون منها، القدرة الشرائية).\n`, // target_audience
    6: `بناءً على المنتج التالي، اكتب 3 "زوايا إعلانية (Ad Angles)" مختلفة وقوية لاستهداف العميل.\n`, // ad_angles
    7: `أعطني 3 "أفكار لفيديوهات قصيرة (Reels/TikTok)" إبداعية لبيع هذا المنتج.\n`, // video_ideas
    8: `اكتب "سكريبت فويس أوفر" مدته 15-20 ثانية قوي ومقنع للعميل المصري لبيع هذا المنتج.\n`, // voiceover_scripts
    9: `اكتب 3 نصوص قصيرة وقوية لتُكتب على "الصور الإعلانية (Ad Image Copy)" لجذب الانتباه فوراً.\n`, // ad_image_copy
    10: `اكتب 4 "ردود جاهزة لتعليقات العملاء" (مثل: بكام؟، التفاصيل؟، الشحن؟، هل المنتج أصلي؟) باللهجة المصرية.\n`, // comment_replies
    11: `ما هي أهم 3 "اعتراضات (Objections)" قد تمنع العميل من شراء هذا المنتج؟ واكتب الرد المقنع لكل اعتراض.\n`, // objections_handling
    12: `اكتب "خطة اختبار سريعة (Testing Plan)" لإعلانات فيسبوك لهذا المنتج (تحديد نوع الكامبين والميزانية المقترحة).\n`, // testing_plan
    13: `اقترح 2 "أفكار عروض Upsell أو Order bump" لزيادة متوسط قيمة الطلب (AOV) لهذا المنتج.\n`, // upsell_ideas
    14: `هل هناك أي "تحذيرات أو كلمات يجب تجنبها" لعدم مخالفة سياسات إعلانات فيسبوك (Facebook Policy) عند الإعلان عن هذا المنتج؟\n` // facebook_policy_warnings
};

async function fixMissingContent() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(FILE_PATH);
    const sheet = workbook.getWorksheet(1);
    
    let fixedCount = 0;

    // Process rows sequentially to strictly avoid rate limits
    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
        const row = sheet.getRow(rowNumber);
        
        const productName = row.getCell(2).value;
        if (!productName) continue;
        
        const price = row.getCell(3).value;
        
        // Find missing cells in this row
        for (let colNumber = 5; colNumber <= 14; colNumber++) {
            const cellValue = row.getCell(colNumber).value || "";
            if (typeof cellValue === 'string' && cellValue.includes("فشل")) {
                console.log(`Fixing row ${rowNumber} (${productName}), column ${colNumber}...`);
                
                const basePromptInfo = `المنتج: ${productName}\nالسعر للمستهلك: ${price} جنيه\n`;
                const fullPrompt = promptTemplates[colNumber] + basePromptInfo;
                
                const newContent = await generateGroqContent(fullPrompt);
                row.getCell(colNumber).value = newContent;
                fixedCount++;
                
                console.log(`Fixed! Saving progress...`);
                await workbook.xlsx.writeFile(FILE_PATH);
                
                // Very safe delay between requests
                await delay(3000); 
            }
        }
    }
    
    console.log(`\nتم الانتهاء! تم إصلاح ${fixedCount} خانة كانت تحتوي على أخطاء.`);
}

fixMissingContent().catch(console.error);
