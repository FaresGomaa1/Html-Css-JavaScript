(function() {
  'use strict';

  function getSeedCourses() {
    const lorem = (n) => (
      'Build practical skills with hands-on projects and modern best practices. '
      + 'This course guides you from fundamentals to real-world proficiency in just a few hours.'
    ).slice(0, n);

    return [
      { id: 1, title: 'Modern JavaScript Essentials', instructor: 'Ava Thompson', level: 'Beginner', category: 'Development', rating: 4.7, reviews: 1843, students: 40210, duration: '4h 20m', publishedAt: '2024-06-14', tags: ['JavaScript', 'ES2023', 'Frontend'], description: lorem(220), url: '#', image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop' },
      { id: 2, title: 'Responsive Web Design', instructor: 'Noah Patel', level: 'Beginner', category: 'Design', rating: 4.8, reviews: 2320, students: 51023, duration: '3h 10m', publishedAt: '2024-03-08', tags: ['CSS', 'Flexbox', 'Grid'], description: lorem(240), url: '#', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop' },
      { id: 3, title: 'React from Zero to Pro', instructor: 'Mia Chen', level: 'Intermediate', category: 'Development', rating: 4.9, reviews: 5210, students: 120432, duration: '6h 45m', publishedAt: '2025-01-02', tags: ['React', 'Hooks', 'SPA'], description: lorem(260), url: '#', image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1200&auto=format&fit=crop' },
      { id: 4, title: 'Data Visualization with Python', instructor: 'Oliver Smith', level: 'Intermediate', category: 'Data', rating: 4.6, reviews: 1803, students: 35012, duration: '5h 00m', publishedAt: '2024-11-20', tags: ['Python', 'Matplotlib', 'Pandas'], description: lorem(240), url: '#', image: 'https://images.unsplash.com/photo-1551281044-8f99e4490b8f?q=80&w=1200&auto=format&fit=crop' },
      { id: 5, title: 'Figma for UI Designers', instructor: 'Lucas Rivera', level: 'Beginner', category: 'Design', rating: 4.7, reviews: 980, students: 25120, duration: '2h 30m', publishedAt: '2023-10-10', tags: ['Figma', 'Prototyping', 'UI'], description: lorem(200), url: '#', image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop' },
      { id: 6, title: 'Product Analytics Foundations', instructor: 'Sophia Nguyen', level: 'Beginner', category: 'Data', rating: 4.5, reviews: 743, students: 17820, duration: '2h 10m', publishedAt: '2024-05-01', tags: ['Analytics', 'A/B Testing', 'Metrics'], description: lorem(200), url: '#', image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1200&auto=format&fit=crop' },
      { id: 7, title: 'Advanced TypeScript Patterns', instructor: 'Ethan Clark', level: 'Advanced', category: 'Development', rating: 4.9, reviews: 3120, students: 65012, duration: '7h 20m', publishedAt: '2024-12-08', tags: ['TypeScript', 'Generics', 'Architecture'], description: lorem(280), url: '#', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop' },
      { id: 8, title: 'SQL for Analysts', instructor: 'Emma Garcia', level: 'Beginner', category: 'Data', rating: 4.6, reviews: 2980, students: 80300, duration: '3h 45m', publishedAt: '2022-08-25', tags: ['SQL', 'Queries', 'Databases'], description: lorem(220), url: '#', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop' },
      { id: 9, title: 'UX Research Toolkit', instructor: 'William Brooks', level: 'Intermediate', category: 'Design', rating: 4.4, reviews: 600, students: 12980, duration: '2h 05m', publishedAt: '2023-04-18', tags: ['UX', 'Research', 'Interviews'], description: lorem(180), url: '#', image: 'https://images.unsplash.com/photo-1529336953121-ad5a0d43d0d4?q=80&w=1200&auto=format&fit=crop' },
      { id: 10, title: 'Next.js for Full‑Stack Apps', instructor: 'Liam Johnson', level: 'Intermediate', category: 'Development', rating: 4.8, reviews: 4021, students: 90541, duration: '5h 30m', publishedAt: '2024-09-12', tags: ['Next.js', 'SSR', 'API'], description: lorem(260), url: '#', image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop' },
      { id: 11, title: 'Email Marketing Mastery', instructor: 'Charlotte Lee', level: 'Beginner', category: 'Marketing', rating: 4.3, reviews: 480, students: 10430, duration: '1h 55m', publishedAt: '2022-12-04', tags: ['Email', 'Copywriting', 'Automation'], description: lorem(180), url: '#', image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1200&auto=format&fit=crop' },
      { id: 12, title: 'Data Structures & Algorithms', instructor: 'Henry Park', level: 'Advanced', category: 'Development', rating: 4.8, reviews: 7210, students: 140320, duration: '8h 40m', publishedAt: '2023-02-15', tags: ['Algorithms', 'Coding Interviews', 'DSA'], description: lorem(300), url: '#', image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200&auto=format&fit=crop' }
    ];
  }

  window.Data = {
    getSeedCourses
  };
})();