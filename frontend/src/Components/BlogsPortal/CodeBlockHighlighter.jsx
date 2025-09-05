import React, { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import axios from 'axios';

// Import supported languages
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup'; // For HTML

const CodeBlockHighlighter = ({ blogId }) => {
  const containerRef = useRef(null);
  const [content, setContent] = useState('');

  // Fetch content from the backend
  useEffect(() => {
    axios.get(`https://alumlink-ruo3.onrender.com/api/v1/blogs/${blogId}`)
      .then(response => {
        setContent(response.data.content);
      })
      .catch(error => console.error('Error fetching content:', error));
  }, [blogId]);

  // Process and highlight code blocks
  useEffect(() => {
    if (!content || !containerRef.current) return; // 🔥 Prevents errors if content is not loaded yet

    const processCodeBlocks = () => {
      const tempContainer = document.createElement('div'); // Preserve original content
      tempContainer.innerHTML = content; // Load existing content

      const preElements = tempContainer.querySelectorAll('pre');

      if (preElements.length === 0) return; // 🔥 If no <pre> elements, stop further processing

      preElements.forEach(pre => {
        let code = pre.querySelector('code');

        if (!code) {
          code = document.createElement('code');
          code.innerHTML = pre.innerHTML;
          pre.innerHTML = '';
          pre.appendChild(code);
        }

        // Detect existing language class or set default
        if (![...code.classList].some(cls => cls.startsWith('language-'))) {
          code.classList.add('language-javascript');
        }

        // Apply styling
        pre.style.background = '#282c34';
        pre.style.borderRadius = '6px';
        pre.style.padding = '1rem';
        pre.style.overflow = 'auto';
        pre.style.margin = '1rem 0';
        code.style.fontFamily = 'monospace';
        code.style.fontSize = '0.9rem';
      });

      Prism.highlightAllUnder(tempContainer); // Only highlight within the temp container

      return tempContainer.innerHTML; // Return modified content
    };

    setTimeout(() => {
      const updatedContent = processCodeBlocks();
      if (!updatedContent) return; // 🔥 Prevents sending empty content

      axios.put(`https://alumlink-ruo3.onrender.com/api/v1/blogs/update/${blogId}`, { content: updatedContent })
        .then(() => console.log('Updated content saved to backend'))
        .catch(err => console.error('Error updating backend:', err));
    }, 200);

  }, [content, blogId]);

  return (
    <div 
      ref={containerRef}
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: content || '<p>Loading content...</p>' }} 
    />
  );
};

export default CodeBlockHighlighter;
