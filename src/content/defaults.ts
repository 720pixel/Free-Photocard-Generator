// Bundled default content. These are the fallback for the public/offline build
// (no database) and the seed values for a fresh full-edition install. Once the
// database holds a row for a slug, that row wins and this copy is only a backstop.

export type DefaultPage = {
  slug: string;
  title: string;
  updatedLabel?: string;
  body: string; // HTML rendered inside the prose-legal shell
};

export const DEFAULT_PAGES: DefaultPage[] = [
  {
    slug: "about",
    title: "About",
    body: `
<p>
  <strong>Free Photocard Generator</strong> is a free online tool for designing and publishing photocards for news
  pages and social media. It runs entirely in your browser: pick a template, drop in a photo, type your headline in
  Bengali or English, and export a pixel-perfect image ready to publish to Facebook, Instagram, YouTube, X and more.
</p>

<h2>What you can do</h2>
<ul>
  <li>Start from dozens of ready-made templates across news, sports, entertainment, quotes, tributes, abstract and collage styles.</li>
  <li>Edit on a fast canvas: photos, text, shapes, frames, textures, gradients, collages and blur or mosaic retouching.</li>
  <li>Export at the exact size for every platform. The layout adapts automatically between post, square, story and cover sizes.</li>
  <li>Full Bengali typography with correct conjuncts and digits, plus a large font library.</li>
</ul>

<h2>Why it is different</h2>
<ul>
  <li><strong>Free forever.</strong> No cost, no subscription, no account needed to design and download.</li>
  <li><strong>No watermark.</strong> Your exports are clean, with no forced branding.</li>
  <li><strong>Private by design.</strong> Editing happens on your device. You do not need to upload your source photos to a server to design a card.</li>
  <li><strong>Works offline.</strong> After the first load the editor keeps working without a connection.</li>
</ul>

<h2>Who makes it</h2>
<p>
  Free Photocard Generator is built and maintained by <a href="https://720p.red" target="_blank" rel="noopener">720p.red</a>.
  The core editor is open source; you can find the code on
  <a href="https://github.com/720pixel/Free-Photocard-Generator" target="_blank" rel="noopener">GitHub</a>.
</p>

<p>
  Ready to make one? <a href="/editor">Open the editor</a> or <a href="/templates">browse the templates</a>.
</p>
`.trim(),
  },
  {
    slug: "terms",
    title: "Terms of Service",
    updatedLabel: "July 2026",
    body: `
<p>
  By using Free Photocard Generator at <a href="https://photocard.720p.red">photocard.720p.red</a> ("the service") you
  agree to these terms. If you do not agree, please do not use the service.
</p>

<h2>Using the service</h2>
<p>
  The service is provided free of charge for creating photocards and social media graphics. You may use it for personal and
  commercial projects. You are responsible for the content you create and publish.
</p>

<h2>Your content</h2>
<p>
  You keep ownership of the photos, text and designs you create. You are responsible for making sure you have the rights to
  any images, fonts, logos or other material you upload or include, and that your content does not infringe anyone
  else's rights or break the law.
</p>

<h2>Acceptable use</h2>
<ul>
  <li>Do not use the service to create content that is illegal, hateful, harassing, defamatory or sexually exploitative.</li>
  <li>Do not impersonate others or spread deliberate misinformation using news-style layouts.</li>
  <li>Do not attempt to disrupt, overload, reverse engineer or gain unauthorized access to the service or its infrastructure.</li>
  <li>Do not use automated means to abuse the export or API endpoints.</li>
</ul>

<h2>Availability and changes</h2>
<p>
  The service is provided on an "as is" and "as available" basis. We may change, suspend or discontinue any
  part of it at any time, and we do not guarantee uninterrupted or error-free operation.
</p>

<h2>Disclaimer and liability</h2>
<p>
  To the maximum extent permitted by law, the service is provided without warranties of any kind, and we are not liable for
  any indirect, incidental or consequential damages arising from your use of it. You use the service at your own risk.
</p>

<h2>Changes to these terms</h2>
<p>We may update these terms from time to time; the date above shows the latest revision. Continued use means you accept the updated terms.</p>

<h2>Contact</h2>
<p>
  Questions about these terms can be sent to <a href="mailto:admean@720p.red">admean@720p.red</a>.
</p>
`.trim(),
  },
];

export const DEFAULT_PAGE_BY_SLUG: Record<string, DefaultPage> = Object.fromEntries(
  DEFAULT_PAGES.map((p) => [p.slug, p]),
);

export type DefaultFaq = {
  questionBn: string;
  questionEn: string;
  answerBn: string;
  answerEn: string;
};

export const DEFAULT_FAQ: DefaultFaq[] = [
  {
    questionBn: "এই ফটোকার্ড জেনারেটর কি সত্যিই ফ্রি?",
    questionEn: "Is this photocard generator really free?",
    answerBn: "হ্যাঁ। সব টেমপ্লেট ও এডিটর ফিচার সম্পূর্ণ ফ্রি, কোনো সাইন আপ ছাড়াই ব্যবহার করা যায়।",
    answerEn: "Yes. All templates and editor features are completely free, usable without any sign up.",
  },
  {
    questionBn: "এক্সপোর্ট করা ছবিতে কি ওয়াটারমার্ক থাকে?",
    questionEn: "Do exported images have a watermark?",
    answerBn: "না। আপনার ডাউনলোড করা ফটোকার্ডে কোনো ওয়াটারমার্ক বা জোরপূর্বক ব্র্যান্ডিং থাকে না।",
    answerEn: "No. Your downloaded photocards carry no watermark or forced branding.",
  },
  {
    questionBn: "আমার ছবি কি কোনো সার্ভারে আপলোড হয়?",
    questionEn: "Are my photos uploaded to a server?",
    answerBn: "এডিটিং পুরোপুরি আপনার ব্রাউজারে হয়। ডিজাইন করার জন্য ছবি আপলোড করার দরকার হয় না।",
    answerEn: "Editing happens fully in your browser. You do not need to upload photos to design.",
  },
  {
    questionBn: "কোন কোন সাইজে এক্সপোর্ট করা যায়?",
    questionEn: "Which sizes can I export?",
    answerBn: "ফেসবুক ও ইনস্টাগ্রাম পোস্ট, স্কয়ার, স্টোরি, ইউটিউব থাম্বনেইল, এক্স, লিংকডইন সহ অনেক প্রিসেট আছে।",
    answerEn: "There are presets for Facebook and Instagram posts, square, story, YouTube thumbnail, X, LinkedIn and more.",
  },
  {
    questionBn: "মোবাইল থেকে ব্যবহার করা যাবে?",
    questionEn: "Can I use it on mobile?",
    answerBn: "হ্যাঁ, এডিটরটি মোবাইল বান্ধব এবং টাচ ইনপুটের জন্য অপ্টিমাইজ করা।",
    answerEn: "Yes, the editor is mobile friendly and optimized for touch input.",
  },
];
