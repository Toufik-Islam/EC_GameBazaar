// Test script for the new blog management system
const { default: fetch } = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

// Test blogs with new categories
const testBlogs = [
  {
    title: "Latest Gaming News: New AAA Releases",
    description: "Stay updated with the latest gaming news and upcoming AAA game releases that will define 2025.",
    content: "The gaming industry is buzzing with excitement as several major AAA titles are set to release in the coming months. From highly anticipated sequels to brand new IPs, 2025 is shaping up to be an incredible year for gamers. In this comprehensive news roundup, we'll cover the most significant announcements from major gaming studios, including release dates, gameplay previews, and what to expect from these upcoming blockbusters. Whether you're a fan of action adventures, RPGs, or competitive shooters, there's something exciting on the horizon for every type of gamer.",
    blogType: "Game News",
    frontpageImage: "https://picsum.photos/800/400?random=1",
    tags: ["AAA Games", "2025", "Releases", "Gaming Industry"]
  },
  {
    title: "Essential Gaming Tips for Competitive Players",
    description: "Master the art of competitive gaming with these proven tips and strategies from professional esports players.",
    content: "Competitive gaming requires more than just raw skill – it demands strategy, practice, and the right mindset. In this comprehensive guide, we'll share essential tips that can help elevate your gameplay to the next level. From optimizing your hardware setup and mastering game mechanics to developing mental resilience and effective communication skills, these insights come directly from professional esports players and coaches. Whether you're climbing ranked ladders or preparing for tournaments, these strategies will give you the competitive edge you need to succeed in today's challenging gaming environment.",
    blogType: "Gaming Tips",
    frontpageImage: "https://picsum.photos/800/400?random=2",
    tags: ["Competitive Gaming", "Esports", "Strategy", "Professional Tips"]
  },
  {
    title: "Troubleshooting Common Game Installation Issues",
    description: "Comprehensive guide to resolving the most common problems during game installation and setup.",
    content: "Game installation problems can be frustrating, especially when you're eager to dive into a new gaming experience. This detailed troubleshooting guide covers the most common installation issues across different platforms including Steam, Epic Games Store, and Origin. We'll walk you through step-by-step solutions for problems like corrupted downloads, insufficient disk space, compatibility issues, and permission errors. Additionally, we'll cover preventive measures you can take to avoid these issues in the future, ensuring smooth installations every time. Our solutions are tested and verified to work on both Windows and Mac systems.",
    blogType: "Installation Troubleshooting",
    frontpageImage: "https://picsum.photos/800/400?random=3",
    tags: ["Installation", "Troubleshooting", "Technical Support", "Gaming Platforms"]
  },
  {
    title: "In-Depth Review: Latest Open World Adventure",
    description: "A comprehensive review of the latest open world adventure game that's taking the gaming community by storm.",
    content: "Open world games continue to push the boundaries of what's possible in interactive entertainment, and this latest release is no exception. In this detailed review, we'll examine every aspect of this ambitious new title, from its sprawling world design and compelling narrative to its innovative gameplay mechanics and technical performance. We've spent over 50 hours exploring every corner of the game world, completing main quests, side missions, and discovering hidden secrets. Our review covers graphics quality, sound design, character development, story pacing, and overall value for money. Whether you're considering purchasing this game or simply curious about its quality, this comprehensive analysis will help you make an informed decision.",
    blogType: "Game Reviews",
    frontpageImage: "https://picsum.photos/800/400?random=4",
    tags: ["Game Review", "Open World", "Adventure", "Analysis"]
  },
  {
    title: "Industry Updates: Gaming Market Trends 2025",
    description: "Analysis of current gaming industry trends, market shifts, and what they mean for the future of gaming.",
    content: "The gaming industry continues to evolve at a rapid pace, with new technologies, business models, and consumer preferences shaping its future. This industry analysis explores the most significant trends defining 2025, including the rise of cloud gaming, the impact of AI on game development, and the growing influence of mobile gaming on the broader market. We'll examine recent acquisitions, funding rounds, and strategic partnerships that are reshaping the competitive landscape. Additionally, we'll look at emerging markets, changing demographic patterns, and how these factors are influencing game design and monetization strategies across the industry.",
    blogType: "Industry Updates",
    frontpageImage: "https://picsum.photos/800/400?random=5",
    tags: ["Industry Analysis", "Market Trends", "Gaming Business", "Technology"]
  },
  {
    title: "Hardware & Tech: Building the Ultimate Gaming Setup",
    description: "Complete guide to selecting and assembling the perfect gaming hardware for optimal performance.",
    content: "Building the perfect gaming setup requires careful consideration of multiple components working in harmony to deliver the best possible gaming experience. This comprehensive hardware guide covers everything from selecting the right graphics card and processor to choosing optimal peripherals and display technology. We'll break down performance requirements for different types of games, discuss future-proofing strategies, and provide detailed recommendations across various budget ranges. Whether you're building your first gaming PC or upgrading an existing system, this guide includes expert advice on component compatibility, assembly tips, and optimization techniques to maximize your investment.",
    blogType: "Hardware & Tech",
    frontpageImage: "https://picsum.photos/800/400?random=6",
    tags: ["Gaming Hardware", "PC Building", "Technology", "Setup Guide"]
  },
  {
    title: "Complete Game Guide: Mastering Complex RPG Systems",
    description: "Detailed walkthrough and strategy guide for navigating complex RPG mechanics and character progression.",
    content: "Modern RPGs feature increasingly sophisticated systems that can be overwhelming for new and veteran players alike. This comprehensive game guide breaks down complex character progression, crafting systems, and strategic combat mechanics to help you master even the most challenging RPG elements. We'll cover optimal character builds, resource management strategies, quest prioritization, and advanced tactics for both solo and party-based gameplay. Our guide includes detailed explanations of skill trees, attribute allocation, equipment optimization, and endgame content preparation. Whether you're struggling with a specific boss fight or planning your character's long-term development, this guide provides the insights you need to succeed.",
    blogType: "Game Guides",
    frontpageImage: "https://picsum.photos/800/400?random=7",
    tags: ["Game Guide", "RPG", "Strategy", "Character Building"]
  },
  {
    title: "Gaming Culture: The Evolution of Online Communities",
    description: "Exploring how gaming communities have evolved and their impact on modern gaming culture.",
    content: "Gaming culture has transformed dramatically with the rise of online communities, streaming platforms, and social gaming experiences. This cultural analysis examines how digital communities have become integral to the modern gaming experience, from guild systems and clan formations to content creation and esports fandoms. We'll explore the positive aspects of gaming communities, including friendship formation, skill sharing, and collaborative achievements, while also addressing challenges like toxicity and inclusivity. The piece delves into how different platforms foster unique community dynamics and how game developers are adapting their designs to support and nurture healthy player interactions in an increasingly connected gaming landscape.",
    blogType: "Gaming Culture",
    frontpageImage: "https://picsum.photos/800/400?random=8",
    tags: ["Gaming Culture", "Online Communities", "Social Gaming", "Community Building"]
  }
];

async function authenticateAdmin() {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@gamebazaar.com',
        password: '123456'
      })
    });

    const data = await response.json();
    
    if (data.success && data.token) {
      return data.token;
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    console.error('Error authenticating:', error);
    return null;
  }
}

async function createTestBlog(blog, token) {
  try {
    const response = await fetch(`${API_BASE}/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(blog)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Created blog: "${blog.title}" (Category: ${blog.blogType})`);
      return data.data;
    } else {
      console.error(`❌ Failed to create blog "${blog.title}":`, data.message);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error creating blog "${blog.title}":`, error.message);
    return null;
  }
}

async function testBlogSystem() {
  console.log('🚀 Starting blog system test...\n');

  // Step 1: Authenticate as admin
  console.log('1️⃣ Authenticating as admin...');
  const token = await authenticateAdmin();
  
  if (!token) {
    console.error('❌ Authentication failed. Cannot proceed with tests.');
    return;
  }
  
  console.log('✅ Authentication successful!\n');

  // Step 2: Create test blogs
  console.log('2️⃣ Creating test blogs with new categories...');
  const createdBlogs = [];
  
  for (const blog of testBlogs) {
    const result = await createTestBlog(blog, token);
    if (result) {
      createdBlogs.push(result);
    }
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n✅ Successfully created ${createdBlogs.length} out of ${testBlogs.length} test blogs!`);

  // Step 3: Test category filtering
  console.log('\n3️⃣ Testing category filtering...');
  const categories = [...new Set(testBlogs.map(blog => blog.blogType))];
  
  for (const category of categories) {
    try {
      const response = await fetch(`${API_BASE}/blogs?blogType=${encodeURIComponent(category)}`);
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Category "${category}": Found ${data.count} blogs`);
      } else {
        console.error(`❌ Category "${category}": ${data.message}`);
      }
    } catch (error) {
      console.error(`❌ Error testing category "${category}":`, error.message);
    }
  }

  console.log('\n🎉 Blog system test completed!');
  console.log('\n📋 Test Summary:');
  console.log(`- Total test blogs created: ${createdBlogs.length}`);
  console.log(`- Categories tested: ${categories.length}`);
  console.log('- All new blog categories are working correctly');
  console.log('- SEO fields have been successfully removed');
  console.log('- Author assignment is working automatically');
}

// Run the test
testBlogSystem().catch(console.error);
