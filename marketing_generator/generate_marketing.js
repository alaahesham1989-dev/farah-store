const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const csv = require('csv-parser');
const ExcelJS = require('exceljs');

const IMGBB_API_KEY = 'bb4650d83ece95a9e9b8f74edda26b0d';
const GROQ_API_KEY = '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';
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // Using larger model for quality marketing copy

const CSV_FILE = 'C:\\Users\\FOX\\Desktop\\فرح لستور\\new_images\\products_analysis.csv';
const OUTPUT_FILE = 'C:\\Users\\FOX\\Desktop\\فرح لستور\\Marketing_Master.xlsx';

async function uploadToImgBB(imagePath) {
    if (!fs.existsSync(imagePath)) {
        console.log(`Image not found: ${imagePath}`);
        return 'IMAGE_NOT_FOUND';
    }
    
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));
    form.append('key', IMGBB_API_KEY);

    try {
        const response = await axios.post('https://api.imgbb.com/1/upload', form, {
            headers: form.getHeaders()
        });
        return response.data.data.url;
    } catch (error) {
        console.error(`ImgBB Upload Error for ${imagePath}:`, error.message);
        return 'UPLOAD_FAILED';
    }
}

async function generateGroqContent(prompt, systemInstruction = "أنت خبير تسويق إلكتروني محترف للسوق المصري.") {
    let retries = 5;
    while (retries > 0) {
        try {
            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model: GROQ_MODEL,
                    messages: [
                        { role: 'system', content: systemInstruction },
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
                console.log(`Rate limit hit. Waiting 15 seconds before retrying... (${retries} retries left)`);
                await delay(15000);
                retries--;
            } else {
                console.error(`Groq API Error:`, error.response?.data?.error?.message || error.message);
                return "فشل في توليد المحتوى بسبب خطأ في الخادم (API Error).";
            }
        }
    }
    return "فشل بسبب تكرار حظر Groq API Rate Limit.";
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function processProduct(product, imagePath) {
    console.log(`\n--- جاري معالجة المنتج: ${product['اسم المنتج التجاري']} (${product['كود المنتج']}) ---`);
    
    // 1. Upload Image
    console.log(`جارِ رفع الصورة لمنتج ${product['كود المنتج']}...`);
    const imageUrl = await uploadToImgBB(imagePath);
    console.log(`تم رفع الصورة: ${imageUrl}`);

    const basePromptInfo = `
المنتج: ${product['اسم المنتج التجاري']}
الوصف المختصر: ${product['وصف المنتج']}
السعر للمستهلك: ${product['أقل سعر مستهلك (ج.م)']} إلى ${product['أعلى سعر مستهلك (ج.م)']} جنيه
`;

    // 2. Parallel Groq Prompts (Promise.all)
    console.log(`جارِ توليد المحتوى التسويقي بـ 10 مهام متوازية (Promise.all)...`);
    
    const prompts = {
        target_audience: `بناءً على المنتج التالي، حدد "الجمهور المستهدف" بالتفصيل (العمر، الاهتمامات، المشاكل التي يعانون منها، القدرة الشرائية).\n${basePromptInfo}`,
        ad_angles: `بناءً على المنتج التالي، اكتب 3 "زوايا إعلانية (Ad Angles)" مختلفة وقوية لاستهداف العميل.\n${basePromptInfo}`,
        video_ideas: `أعطني 3 "أفكار لفيديوهات قصيرة (Reels/TikTok)" إبداعية لبيع هذا المنتج.\n${basePromptInfo}`,
        voiceover_scripts: `اكتب "سكريبت فويس أوفر" مدته 15-20 ثانية قوي ومقنع للعميل المصري لبيع هذا المنتج.\n${basePromptInfo}`,
        ad_image_copy: `اكتب 3 نصوص قصيرة وقوية لتُكتب على "الصور الإعلانية (Ad Image Copy)" لجذب الانتباه فوراً.\n${basePromptInfo}`,
        comment_replies: `اكتب 4 "ردود جاهزة لتعليقات العملاء" (مثل: بكام؟، التفاصيل؟، الشحن؟، هل المنتج أصلي؟) باللهجة المصرية.\n${basePromptInfo}`,
        objections_handling: `ما هي أهم 3 "اعتراضات (Objections)" قد تمنع العميل من شراء هذا المنتج؟ واكتب الرد المقنع لكل اعتراض.\n${basePromptInfo}`,
        testing_plan: `اكتب "خطة اختبار سريعة (Testing Plan)" لإعلانات فيسبوك لهذا المنتج (تحديد نوع الكامبين والميزانية المقترحة).\n${basePromptInfo}`,
        upsell_ideas: `اقترح 2 "أفكار عروض Upsell أو Order bump" لزيادة متوسط قيمة الطلب (AOV) لهذا المنتج.\n${basePromptInfo}`,
        facebook_policy_warnings: `هل هناك أي "تحذيرات أو كلمات يجب تجنبها" لعدم مخالفة سياسات إعلانات فيسبوك (Facebook Policy) عند الإعلان عن هذا المنتج؟\n${basePromptInfo}`
    };

    const tasks = Object.entries(prompts).map(async ([key, prompt]) => {
        const content = await generateGroqContent(prompt);
        return { key, content };
    });

    const results = await Promise.all(tasks);
    console.log(`تم الانتهاء من توليد الـ 10 أقسام بنجاح لمنتج ${product['كود المنتج']}.`);

    const marketingData = { imageUrl };
    results.forEach(res => {
        marketingData[res.key] = res.content;
    });

    return marketingData;
}

async function main() {
    console.log("Reading products from CSV...");
    const products = [];
    
    await new Promise((resolve, reject) => {
        fs.createReadStream(CSV_FILE)
            .pipe(csv())
            .on('data', (data) => products.push(data))
            .on('end', resolve)
            .on('error', reject);
    });

    console.log(`Found ${products.length} products. Starting processing...`);
    
    // Setup Excel Workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Marketing Content');
    
    sheet.columns = [
        { header: 'كود المنتج', key: 'code', width: 15 },
        { header: 'اسم المنتج التجاري', key: 'name', width: 25 },
        { header: 'سعر المستهلك', key: 'price', width: 15 },
        { header: 'رابط الصورة المباشر', key: 'imageUrl', width: 40 },
        { header: '1. الجمهور المستهدف', key: 'target_audience', width: 50 },
        { header: '2. الزوايا الإعلانية', key: 'ad_angles', width: 50 },
        { header: '3. أفكار الفيديوهات', key: 'video_ideas', width: 50 },
        { header: '4. سكريبت الفويس أوفر', key: 'voiceover_scripts', width: 50 },
        { header: '5. نصوص الصور الإعلانية', key: 'ad_image_copy', width: 50 },
        { header: '6. ردود كومنتات جاهزة', key: 'comment_replies', width: 50 },
        { header: '7. اعتراضات العميل والرد', key: 'objections_handling', width: 50 },
        { header: '8. خطة اختبار الإعلانات', key: 'testing_plan', width: 50 },
        { header: '9. أفكار عروض Upsell', key: 'upsell_ideas', width: 50 },
        { header: '10. تحذيرات سياسات فيسبوك', key: 'facebook_policy_warnings', width: 50 }
    ];

    // Process in small batches (e.g., 2 at a time) to avoid Groq Rate Limits (2 * 10 = 20 concurrent requests max)
    const BATCH_SIZE = 2;
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
        const batch = products.slice(i, i + BATCH_SIZE);
        
        const batchPromises = batch.map(async (product) => {
            // Reconstruct the image path from the local URL or generate it
            // local URL format: file:///C:/Users/FOX/Desktop/فرح%20لستور/new_images/5881709725215297378.jpg
            let rawUrl = product['رابط الصورة المحلي'];
            let filename = decodeURIComponent(rawUrl.split('/').pop());
            let imagePath = path.join('C:\\Users\\FOX\\Desktop\\فرح لستور\\new_images', filename);
            
            const mData = await processProduct(product, imagePath);
            
            sheet.addRow({
                code: product['كود المنتج'],
                name: product['اسم المنتج التجاري'],
                price: `${product['أقل سعر مستهلك (ج.م)']} - ${product['أعلى سعر مستهلك (ج.م)']}`,
                imageUrl: mData.imageUrl,
                target_audience: mData.target_audience,
                ad_angles: mData.ad_angles,
                video_ideas: mData.video_ideas,
                voiceover_scripts: mData.voiceover_scripts,
                ad_image_copy: mData.ad_image_copy,
                comment_replies: mData.comment_replies,
                objections_handling: mData.objections_handling,
                testing_plan: mData.testing_plan,
                upsell_ideas: mData.upsell_ideas,
                facebook_policy_warnings: mData.facebook_policy_warnings
            });
        });
        
        await Promise.all(batchPromises);
        
        // Save workbook incrementally
        await workbook.xlsx.writeFile(OUTPUT_FILE);
        console.log(`تم حفظ الدفعة بنجاح في ملف الإكسل. (المنتجات: ${i + 1} إلى ${Math.min(i + BATCH_SIZE, products.length)})`);
        
        // Delay to avoid strict rate limit (60s delay is safe)
        if (i + BATCH_SIZE < products.length) {
            console.log("الانتظار 10 ثوانٍ لتجنب حظر Groq API Rate Limit...");
            await delay(10000); 
        }
    }
    
    console.log(`\n\n🎉 تم الانتهاء بنجاح! تم إنشاء الملف الشامل: ${OUTPUT_FILE}`);
}

main().catch(console.error);
