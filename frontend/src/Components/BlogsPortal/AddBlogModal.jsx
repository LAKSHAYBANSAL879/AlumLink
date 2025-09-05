import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/atom-one-dark.css';

import { X,   Image as ImageIcon, Tag, Type, FileText,  User, Save, XCircle,
  Bold, Italic,  Underline as UnderlineIcon, Link as LinkIcon,  AlignLeft,  AlignCenter,  AlignRight,  List,  ListOrdered, Heading,
  Code as CodeIcon,  Palette} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Add custom styles for the editor
const editorStyles = `
  .ProseMirror {
    min-height: 200px;
    padding: 1rem;
  }
  
  /* Code block styling */
  .ProseMirror pre {
    background-color: #282c34;
    border-radius: 0.3rem;
    color: #abb2bf;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    padding: 0.75rem 1rem;
    margin: 1rem 0;
    overflow-x: auto;
  }
  
  .ProseMirror code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
  }
  
  /* Add tab spacing for code blocks */
  .ProseMirror pre code {
    tab-size: 2;
  }
`;

const AddBlogModal = ({ isOpen, onClose, loggedInUser }) => {
  // State for form fields
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    category: '',
    content: '',
    coverPhoto: null,
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  
  // Ref for file input
  const fileInputRef = useRef(null);
  const lowlight = createLowlight();
  lowlight.register('html', html);
  lowlight.register('js', javascript);
  lowlight.register('css', css);
  lowlight.register('python', python);
  
  // Create Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default code block to use lowlight version
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      CodeBlockLowlight.configure({
        lowlight,
        languageClassPrefix: 'language-',
        HTMLAttributes: {
          class: 'code-block', // Add a class for additional styling
        }
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setFormData(prevState => ({
        ...prevState,
        content: editor.getHTML()
      }));
    },
  });
  
  // Color picker ref
  const colorPickerRef = useRef(null);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  // Handle cover image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevState => ({
        ...prevState,
        coverPhoto: file
      }));
      
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create blog post data including user info
    const blogData = new FormData();
    blogData.append("title", formData.title);
    blogData.append("subtitle", formData.subtitle);
    blogData.append("category", formData.category);
    blogData.append("content", formData.content);
    blogData.append("author", loggedInUser?._id);
    blogData.append("createdAt", new Date().toISOString());

    if (formData.coverPhoto) {
      blogData.append("coverPhoto", formData.coverPhoto);
    }

    
   try{
    const response = await axios.post(
      "https://alumlink-ruo3.onrender.com/api/v1/blogs/create",
      blogData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    if (response.status === 201 || response.status === 200) {
    
      toast.success('Blog post created successfully!');
      console.log("new blog created sucessfully");
      resetForm();
      onClose();
   }
  }
   catch{
console.error("erron in creating a new blog post");
   } 
  };
  
  // Reset the form
  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      category: '',
      content: '',
      coverPhoto: '',
    });
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (editor) editor.commands.setContent('');
  };
  
  // Handle code block insertion with language selection
  const handleCodeBlockInsert = () => {
    if (!editor) return;
    
    // Create an array of supported languages
    const supportedLanguages = ['javascript', 'js', 'python', 'css', 'html'];
    
    // Show a prompt with language options
    const language = window.prompt(
      `Enter programming language (supported: ${supportedLanguages.join(', ')}):`, 
      'javascript'
    );
    
    if (language) {
      // Default to javascript if an unsupported language is entered
      const normalizedLang = supportedLanguages.includes(language) ? language : 'javascript';
      editor.chain().focus().setCodeBlock({ language: normalizedLang }).run();
    }
  };
  
  // Clean up editor on component unmount
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  // Toolbar button component
  const ToolbarButton = ({ onClick, icon: Icon, title, isActive = null }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-md ${isActive ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
      title={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto shadow-xl">
        {/* Inject the custom styles */}
        <style>{editorStyles}</style>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">Add New Blog Post</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Category Selection */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-2">
                <Tag className="w-4 h-4" />
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                <option value="technology">Technology</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="business">Business</option>
                <option value="health">Health</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            {/* Title */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-2">
                <Type className="w-4 h-4" />
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter blog title"
                required
              />
            </div>
            
            {/* Subtitle */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-2">
                <FileText className="w-4 h-4" />
                Subtitle
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter blog subtitle"
              />
            </div>
            
            {/* Cover Image */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-2">
                <ImageIcon className="w-4 h-4" />
                Cover Image
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-l-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Choose File
                </button>
                <input
                  type="text"
                  className="flex-grow px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50"
                  value={formData.coverPhoto ? formData.coverPhoto.name : "No file chosen"}
                  readOnly
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="relative group">
                    <img 
                      src={imagePreview} 
                      alt="Cover preview" 
                      className="w-full max-h-48 object-cover rounded-md border border-gray-200" 
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, coverPhoto:'' }));
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* User Info Display (Read-only) */}
            <div className="mb-4 bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <User className="w-4 h-4" />
                Author Information
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Author:</span> {loggedInUser?.name || 'Anonymous'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {loggedInUser?.email || 'No email provided'}
                </p>
              </div>
            </div>
            
            {/* Content with Tiptap */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-gray-700 text-sm font-bold mb-2">
                <FileText className="w-4 h-4" />
                Content
              </label>
              <div className="border border-gray-300 rounded-md">
                {/* Editor Toolbar */}
                {editor && (
                  <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
                    {/* Headings */}
                    <select
                      value={
                        editor.isActive('heading', { level: 1 }) ? '1' :
                        editor.isActive('heading', { level: 2 }) ? '2' :
                        editor.isActive('heading', { level: 3 }) ? '3' :
                        editor.isActive('heading', { level: 4 }) ? '4' :
                        editor.isActive('heading', { level: 5 }) ? '5' :
                        editor.isActive('heading', { level: 6 }) ? '6' : 'paragraph'
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'paragraph') {
                          editor.chain().focus().setParagraph().run();
                        } else {
                          editor.chain().focus().toggleHeading({ level: parseInt(value) }).run();
                        }
                      }}
                      className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="paragraph">Paragraph</option>
                      <option value="1">Heading 1</option>
                      <option value="2">Heading 2</option>
                      <option value="3">Heading 3</option>
                      <option value="4">Heading 4</option>
                      <option value="5">Heading 5</option>
                      <option value="6">Heading 6</option>
                    </select>
                    
                    <div className="w-px h-6 bg-gray-300 mx-2"></div>
                    
                    {/* Text formatting */}
                    <ToolbarButton 
                      onClick={() => editor.chain().focus().toggleBold().run()} 
                      icon={Bold} 
                      title="Bold" 
                      isActive={editor.isActive('bold')}
                    />
                    <ToolbarButton 
                      onClick={() => editor.chain().focus().toggleItalic().run()} 
                      icon={Italic} 
                      title="Italic" 
                      isActive={editor.isActive('italic')}
                    />
                    <ToolbarButton 
                      onClick={() => editor.chain().focus().toggleUnderline().run()} 
                      icon={UnderlineIcon} 
                      title="Underline" 
                      isActive={editor.isActive('underline')}
                    />
                    
                    {/* Color Picker */}
                    <div className="relative">
                      <ToolbarButton 
                        onClick={() => colorPickerRef.current.click()} 
                        icon={Palette} 
                        title="Text Color" 
                      />
                      <input
                        ref={colorPickerRef}
                        type="color"
                        onChange={(e) => {
                          editor.chain().focus().setColor(e.target.value).run();
                        }}
                        className="absolute opacity-0 w-0 h-0 pointer-events-none"
                      />
                    </div>
                    
                    <div className="w-px h-6 bg-gray-300 mx-2"></div>
                    
                    {/* Lists */}
                    <ToolbarButton 
                      onClick={() => editor.chain().focus().toggleBulletList().run()} 
                      icon={List} 
                      title="Bullet List" 
                      isActive={editor.isActive('bulletList')}
                    />
                    <ToolbarButton 
                      onClick={() => editor.chain().focus().toggleOrderedList().run()} 
                      icon={ListOrdered} 
                      title="Ordered List" 
                      isActive={editor.isActive('orderedList')}
                    />
                    
                    <div className="w-px h-6 bg-gray-300 mx-2"></div>
                    
                    {/* Alignment */}
                    <ToolbarButton 
                      onClick={() => editor.chain().focus().setTextAlign('left').run()} 
                      icon={AlignLeft} 
                      title="Align Left" 
                      isActive={editor.isActive({ textAlign: 'left' })}
                    />
                    <ToolbarButton 
                      onClick={() => editor.chain().focus().setTextAlign('center').run()} 
                      icon={AlignCenter} 
                      title="Align Center" 
                      isActive={editor.isActive({ textAlign: 'center' })}
                    />
                    <ToolbarButton 
                      onClick={() => editor.chain().focus().setTextAlign('right').run()} 
                      icon={AlignRight} 
                      title="Align Right" 
                      isActive={editor.isActive({ textAlign: 'right' })}
                    />
                    
                    <div className="w-px h-6 bg-gray-300 mx-2"></div>
                    
                    {/* Code Block */}
                    <ToolbarButton 
                      onClick={handleCodeBlockInsert} 
                      icon={CodeIcon} 
                      title="Add Code Block" 
                      isActive={editor.isActive('codeBlock')}
                    />
                    
                    {/* Link */}
                    <ToolbarButton 
                      onClick={() => {
                        if (!editor) return;
                        const url = window.prompt('Enter URL:', 'https://');
                        if (url) {
                          editor.chain().focus().setLink({ href: url }).run();
                        }
                      }} 
                      icon={LinkIcon} 
                      title="Add Link" 
                      isActive={editor?.isActive('link')}
                    />
                    
                    {/* Image */}
                    <ToolbarButton 
                      onClick={() => {
                        const url = window.prompt('Image URL');
                        if (url) {
                          editor.chain().focus().setImage({ src: url }).run();
                        }
                      }}
                      icon={ImageIcon} 
                      title="Add Image" 
                    />
                  </div>
                )}
                
                {/* Editor Content */}
                <div className="min-h-64">
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>
            
           
           
            
            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Publish Blog
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBlogModal;