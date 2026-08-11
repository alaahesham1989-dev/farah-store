const fs = require('fs');
const axios = require('axios');
const ExcelJS = require('exceljs');

const GROQ_API_KEY = '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';
const GROQ_MODEL = 'llama-3.1-8b-instant'; 

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
                        { role: 'system', content: "أنت خبير تسويق إلكتروني محترف للسوق المصري. قم بتقديم إجابتك بتنسيق JSON حصراً يحتوي على 10 مفاتيح." },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    response_format: { type: "json_object" }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return JSON.parse(response.data.choices[0].message.content.trim());
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.log(`Rate limit hit! Waiting 20 seconds...`);
                await delay(20000);
                retries--;
            } else {
                console.error(`Groq API Error:`, error.message);
                await delay(10000);
                retries--;
            }
        }
    }
    return null;
}

async function fixMissingContent() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(FILE_PATH);
    const sheet = workbook.getWorksheet(1);
    
    let fixedCount = 0;

    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
        const row = sheet.getRow(rowNumber);
        
        const productName = row.getCell(2).value;
        if (!productName) continue;
        
        const price = row.getCell(3).value;
        
        // Check if ANY of the 10 cells are missing or contain "فشل"
        let isMissing = false;
        for (let colNumber = 5; colNumber <= 14; colNumber++) {
            const cellValue = row.getCell(colNumber).value || "";
            if (typeof cellValue === 'string' && cellValue.includes("فشل")) {
                isMissing = true;
                break;
            }
        }
        
        if (isMissing) {
            console.log(`Fixing row ${rowNumber} (${productName}) using SINGLE PROMPT...`);
            
            const fullPrompt = `المنتج: ${productName}
السعر: ${price} جنيه
استخرج البيانات التسويقية التالية لهذا المنتج باللهجة المصرية، وضعها في كائن JSON بالهيكلية التالية:
{
  "target_audience": "تفاصيل الجمهور المستهدف",
  "ad_angles": "3 زوايا إعلانية مختلفة",
  "video_ideas": "3 أفكار لفيديوهات",
  "voiceover_scripts": "سكريبت فويس أوفر لمدة 15 ثانية",
  "ad_image_copy": "3 نصوص للصور الإعلانية",
  "comment_replies": "4 ردود جاهزة للتعليقات",
  "objections_handling": "أهم 3 اعتراضات والرد عليها",
  "testing_plan": "خطة اختبار الإعلانات",
  "upsell_ideas": "فكرتين لعروض Upsell",
  "facebook_policy_warnings": "تحذيرات سياسات فيسبوك للمنتج"
}`;

            const newContent = await generateGroqContent(fullPrompt);
            if (newContent) {
                row.getCell(5).value = newContent.target_audience || "N/A";
                row.getCell(6).value = newContent.ad_angles || "N/A";
                row.getCell(7).value = newContent.video_ideas || "N/A";
                row.getCell(8).value = newContent.voiceover_scripts || "N/A";
                row.getCell(9).value = newContent.ad_image_copy || "N/A";
                row.getCell(10).value = newContent.comment_replies || "N/A";
                row.getCell(11).value = newContent.objections_handling || "N/A";
                row.getCell(12).value = newContent.testing_plan || "N/A";
                row.getCell(13).value = newContent.upsell_ideas || "N/A";
                row.getCell(14).value = newContent.facebook_policy_warnings || "N/A";
                
                fixedCount++;
                console.log(`Successfully generated 10 sections for ${productName}. Saving...`);
                await workbook.xlsx.writeFile(FILE_PATH);
                
                console.log(`Waiting 15 seconds before next product to avoid Rate Limit...`);
                await delay(15000); 
            } else {
                console.log(`Failed to generate JSON for ${productName}.`);
            }
        }
    }
    
    console.log(`\nتم الانتهاء! تم إصلاح ${fixedCount} منتج كانت تحتوي بياناتها على أخطاء.`);
}

fixMissingContent().catch(console.error);
