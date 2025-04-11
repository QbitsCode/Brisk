'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// UI Components
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Icons
import { Copy, Check, ChevronRight, Menu, X, ExternalLink, AlertCircle, Link2 } from 'lucide-react'

interface Section {
  id: string
  title: string
  content: string[]
  subsections?: { id: string; title: string; content: string[] }[]
}

// Main component with client-side only rendering
const DocsPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  
  // Only access hooks after component is mounted (client-side)
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Return early with a loading state if not mounted
  if (!isMounted) {
    return <div className="flex items-center justify-center min-h-screen">Loading documentation...</div>;
  }
  
  return (
    <ClientDocsContent />
  );
};

// Client component that safely uses all hooks
function ClientDocsContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('')
  const [isCopied, setIsCopied] = useState<{[key: string]: boolean}>({})
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [title, setTitle] = useState('')
  const [introduction, setIntroduction] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{sectionId: string, subsectionId?: string, title: string}[]>([])
  const [parsedSections, setParsedSections] = useState<{[key: string]: React.ReactNode[]}>({})
  const [toast, setToast] = useState<{show: boolean, message: string}>({ show: false, message: '' })

  // Function to show toast notification
  const showToast = (message: string) => {
    setToast({ show: true, message })
    setTimeout(() => {
      setToast({ show: false, message: '' })
    }, 3000)
  }

  // Function to copy URL
  const copyUrl = (sectionId: string) => {
    const url = `${window.location.origin}${pathname}?section=${sectionId}`
    navigator.clipboard.writeText(url)
    showToast('URL copied to clipboard')
  }

  // Function to parse markdown sections
  const parseMarkdown = (markdown: string) => {
    try {
      // Extract title (# Brisk Documentation)
      const titleMatch = markdown.match(/^# (.+)$/m)
      if (titleMatch) {
        setTitle(titleMatch[1])
      }

      // Process multi-line callouts before splitting into sections
      // Replace multi-line callouts with single-line placeholder
      const calloutRegex = /^> \[!(NOTE|TIP|WARNING|IMPORTANT)\]\s*\n((?:> .*\n)+)/gm
      const processedMarkdown = markdown.replace(calloutRegex, (match: string, type: string, content: string) => {
        // Combine multi-line content into a single line
        const combinedContent = content
          .split('\n')
          .map((line: string) => line.replace(/^> /, '').trim())
          .join(' ')
          .trim()
        
        return `> [!${type}] ${combinedContent}\n`
      })

      // Split by ## to get main sections
      const sectionSplit = processedMarkdown.split(/^## (.+)$/m)
      if (sectionSplit.length > 1) {
        // Extract introduction (everything before the first ## heading)
        const intro = sectionSplit[0].trim()
        setIntroduction(intro.split('\n').filter(line => line.trim() !== ''))

        // Process sections
        const parsedSections: Section[] = []
        
        for (let i = 1; i < sectionSplit.length; i += 2) {
          if (i + 1 < sectionSplit.length) {
            const sectionTitle = sectionSplit[i].trim()
            const sectionContent = sectionSplit[i + 1].trim()
            
            // Create section ID
            const sectionId = sectionTitle.toLowerCase().replace(/[^\w]+/g, '-')
            
            // Split section content by subsections (### headings)
            const subsectionSplit = sectionContent.split(/^### (.+)$/m)
            const mainContent = subsectionSplit[0].split('\n').filter(line => line.trim() !== '')
            
            const section: Section = {
              id: sectionId,
              title: sectionTitle,
              content: mainContent,
              subsections: []
            }
            
            // Process subsections if any
            if (subsectionSplit.length > 1) {
              for (let j = 1; j < subsectionSplit.length; j += 2) {
                if (j + 1 < subsectionSplit.length) {
                  const subsectionTitle = subsectionSplit[j].trim()
                  const subsectionContent = subsectionSplit[j + 1].trim()
                  const subsectionId = `${sectionId}-${subsectionTitle.toLowerCase().replace(/[^\w]+/g, '-')}`
                  
                  section.subsections?.push({
                    id: subsectionId,
                    title: subsectionTitle,
                    content: subsectionContent.split('\n').filter(line => line.trim() !== '')
                  })
                }
              }
            }
            
            parsedSections.push(section)
          }
        }
        
        setSections(parsedSections)
        
        // Set active section from URL or default to first section
        const section = searchParams.get('section') || (parsedSections[0]?.id || '')
        setActiveSection(section)
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Error parsing markdown:', err)
      setError('Failed to parse documentation content. Please try refreshing the page.')
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchDocumentation = async () => {
      try {
        setLoading(true)
        // Add a small delay to ensure loading state is visible
        // This helps prevent the UI from flickering if the load is quick
        const response = await fetch('/full_documentation.md')
        if (!response.ok) {
          throw new Error(`Failed to fetch documentation: ${response.status} ${response.statusText}`)
        }
        const text = await response.text()
        if (!text) {
          throw new Error('Documentation file is empty')
        }
        
        // Use setTimeout to give the browser a chance to render the loading state
        // before doing the expensive parsing
        setTimeout(() => {
          parseMarkdown(text)
        }, 50)
      } catch (err: any) {
        console.error('Failed to load documentation:', err)
        setError(err.message || 'Failed to load documentation')
        setLoading(false)
      }
    }

    fetchDocumentation()
  }, [])

  useEffect(() => {
    // Update URL when active section changes
    if (activeSection && !loading) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('section', activeSection)
      // Removed unused router variable
    }
  }, [activeSection, pathname, loading, searchParams])

  // Handle section selection
  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId)
    setSearchQuery('')
    setSearchResults([])
  }
  
  // Search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)
    
    if (!query) {
      setSearchResults([])
      return
    }
    
    // Search through all sections and subsections
    const results: {sectionId: string, subsectionId?: string, title: string}[] = []
    
    sections.forEach(section => {
      // Check section title
      if (section.title.toLowerCase().includes(query)) {
        results.push({
          sectionId: section.id,
          title: section.title
        })
      }
      
      // Check section content
      const sectionContentText = section.content.join(' ').toLowerCase()
      if (sectionContentText.includes(query) && !results.some(r => r.sectionId === section.id && !r.subsectionId)) {
        results.push({
          sectionId: section.id,
          title: section.title
        })
      }
      
      // Check subsections
      section.subsections?.forEach(subsection => {
        if (subsection.title.toLowerCase().includes(query)) {
          results.push({
            sectionId: section.id,
            subsectionId: subsection.id,
            title: `${section.title} > ${subsection.title}`
          })
        }
        
        // Check subsection content
        const subsectionContentText = subsection.content.join(' ').toLowerCase()
        if (subsectionContentText.includes(query) && !results.some(r => r.sectionId === section.id && r.subsectionId === subsection.id)) {
          results.push({
            sectionId: section.id,
            subsectionId: subsection.id,
            title: `${section.title} > ${subsection.title}`
          })
        }
      })
    })
    
    setSearchResults(results)
  }

  // Copy code to clipboard
  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setIsCopied({...isCopied, [id]: true})
    setTimeout(() => {
      setIsCopied({...isCopied, [id]: false})
    }, 2000)
  }

  // Process markdown content for rendering
  const renderContent = (content: string[]) => {
    // First, collect all multi-line blockquotes (including callouts)
    const processedContent: string[] = []
    let currentBlockquote: string[] = []
    let isInBlockquote = false
    let blockquoteType: string | null = null
    
    // Pre-process to handle multi-line blockquotes and callouts
    content.forEach((line, i) => {
      if (line.startsWith('> [!')) {
        // Start of a callout
        if (isInBlockquote) {
          // Process previous blockquote if there was one
          if (currentBlockquote.length > 0) {
            const combinedContent = currentBlockquote.join(' ').trim()
            if (blockquoteType) {
              processedContent.push(`> [!${blockquoteType}] ${combinedContent}`)
            } else {
              processedContent.push(`> ${combinedContent}`)
            }
          }
        }
        
        // Extract callout type
        const match = line.match(/> \[!(NOTE|TIP|WARNING|IMPORTANT)\](.*)/)
        if (match) {
          isInBlockquote = true
          blockquoteType = match[1]
          currentBlockquote = [match[2].trim()]
        }
      } else if (line.startsWith('> ')) {
        // Continuation of a blockquote or start of a regular blockquote
        if (!isInBlockquote) {
          isInBlockquote = true
          blockquoteType = null
        }
        currentBlockquote.push(line.substring(2).trim())
      } else {
        // Not a blockquote line
        if (isInBlockquote) {
          // End of blockquote
          const combinedContent = currentBlockquote.join(' ').trim()
          if (blockquoteType) {
            processedContent.push(`> [!${blockquoteType}] ${combinedContent}`)
          } else {
            processedContent.push(`> ${combinedContent}`)
          }
          isInBlockquote = false
          currentBlockquote = []
          blockquoteType = null
        }
        processedContent.push(line)
      }
      
      // Handle end of content
      if (i === content.length - 1 && isInBlockquote) {
        const combinedContent = currentBlockquote.join(' ').trim()
        if (blockquoteType) {
          processedContent.push(`> [!${blockquoteType}] ${combinedContent}`)
        } else {
          processedContent.push(`> ${combinedContent}`)
        }
      }
    })
    
    // Now render the processed content
    return processedContent.map((line, index) => {
      // Code blocks
      if (line.startsWith('```') && line.length > 3) {
        const codeBlockStart = index
        const language = line.slice(3).trim()
        let codeContent = ''
        let endIndex = -1
        
        for (let i = codeBlockStart + 1; i < processedContent.length; i++) {
          if (processedContent[i] === '```') {
            endIndex = i
            break
          }
          codeContent += processedContent[i] + '\n'
        }
        
        if (endIndex !== -1) {
          const blockId = `code-block-${codeBlockStart}`
          const code = codeContent.trim()
          
          return (
            <div key={`code-${index}`} className="my-4 relative">
              <div className="flex justify-between items-center bg-slate-800 rounded-t-md px-4 py-2">
                <span className="text-sm text-slate-400">{language}</span>
                <button
                  onClick={() => handleCopyCode(code, blockId)}
                  className="text-slate-400 hover:text-white"
                  aria-label="Copy code"
                >
                  {isCopied[blockId] ? <Check size={16} /> : 
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-md-heavy">
                    <path fillRule="evenodd" clipRule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path>
                  </svg>
                  }
                </button>
              </div>
              <pre className="bg-slate-900 overflow-x-auto p-4 rounded-b-md">
                <code className="text-sm text-slate-200 font-mono">
                  {code.split('\n').map((line, i) => {
                    // Simple syntax highlighting
                    let highlightedLine = line;
                    
                    // Highlight keywords
                    const keywords = ['import', 'from', 'def', 'class', 'function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'try', 'catch', 'async', 'await'];
                    keywords.forEach(keyword => {
                      highlightedLine = highlightedLine.replace(
                        new RegExp(`\\b${keyword}\\b`, 'g'), 
                        `<span class="text-blue-400">${keyword}</span>`
                      );
                    });
                    
                    // Highlight strings
                    highlightedLine = highlightedLine.replace(
                      /(['"])(.*?)\1/g, 
                      '<span class="text-green-400">$&</span>'
                    );
                    
                    // Highlight numbers
                    highlightedLine = highlightedLine.replace(
                      /\b(\d+)\b/g, 
                      '<span class="text-yellow-400">$1</span>'
                    );
                    
                    // Highlight comments
                    if (highlightedLine.includes('//') || highlightedLine.includes('#')) {
                      highlightedLine = highlightedLine.replace(
                        /(\/\/|#)(.*)$/g, 
                        '<span class="text-slate-500">$&</span>'
                      );
                    }
                    
                    return (
                      <div key={i} className="whitespace-pre" dangerouslySetInnerHTML={{ __html: highlightedLine }} />
                    );
                  })}
                </code>
              </pre>
            </div>
          )
        }
      }
      
      // Skip code block end markers
      if (line === '```') {
        return null
      }
      
      // Skip lines that are part of a code block
      let isInCodeBlock = false
      for (let i = 0; i < index; i++) {
        if (processedContent[i].startsWith('```')) {
          isInCodeBlock = !isInCodeBlock
        }
      }
      if (isInCodeBlock) {
        return null
      }
      
      // Process callouts/admonitions
      if (line.startsWith('> [!NOTE]') || line.startsWith('> [!TIP]') || 
          line.startsWith('> [!WARNING]') || line.startsWith('> [!IMPORTANT]')) {
        const calloutType = line.match(/\[!(.*?)\]/)?.[1].toLowerCase() || 'note'
        const calloutContent = line.replace(/^> \[!.*?\]/, '').trim()
        
        // Determine icon and color based on callout type
        let icon = 'ℹ️'
        let bgColorClass = 'bg-slate-800'
        let borderColorClass = 'border-blue-500'
        
        if (calloutType === 'tip') {
          icon = '💡'
          bgColorClass = 'bg-slate-800'
          borderColorClass = 'border-green-500'
        } else if (calloutType === 'warning') {
          icon = '⚠️'
          bgColorClass = 'bg-slate-800'
          borderColorClass = 'border-yellow-500'
        } else if (calloutType === 'important') {
          icon = '🔔'
          bgColorClass = 'bg-slate-800'
          borderColorClass = 'border-red-500'
        }
        
        return (
          <div 
            key={`callout-${index}`} 
            className={`my-4 p-4 rounded-md border-l-4 ${borderColorClass} ${bgColorClass}`}
          >
            <div className="flex items-start">
              <span className="mr-3 text-xl">{icon}</span>
              <div>
                <p className="font-medium text-white">{calloutType.charAt(0).toUpperCase() + calloutType.slice(1)}</p>
                <p className="mt-1 text-slate-300">{calloutContent}</p>
              </div>
            </div>
          </div>
        )
      }
      
      // Also handle regular blockquotes for backward compatibility
      if (line.startsWith('> ')) {
        const content = line.substring(2).trim()
        return (
          <div 
            key={`blockquote-${index}`} 
            className="my-4 p-4 rounded-md border-l-4 border-slate-500 bg-slate-800"
          >
            <p className="text-slate-300">{content}</p>
          </div>
        )
      }
      
      // Headers
      if (line.startsWith('### ')) {
        return <h3 key={`h3-${index}`} className="text-xl font-semibold mt-8 mb-4">{line.substring(4)}</h3>
      }
      if (line.startsWith('#### ')) {
        return <h4 key={`h4-${index}`} className="text-lg font-semibold mt-6 mb-3">{line.substring(5)}</h4>
      }
      
      // Lists
      if (line.startsWith('- ')) {
        return <li key={`li-${index}`} className="ml-6 list-disc">{line.substring(2)}</li>
      }
      if (line.match(/^\d+\. /)) {
        return <li key={`oli-${index}`} className="ml-6 list-decimal">{line.replace(/^\d+\. /, '')}</li>
      }
      
      // Links
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
      if (linkRegex.test(line)) {
        let processed = line
        let match
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
        
        // Reset regex
        linkRegex.lastIndex = 0
        
        // Process all links in the line
        while ((match = linkRegex.exec(line)) !== null) {
          const [fullMatch, text, url] = match
          processed = processed.replace(
            fullMatch,
            `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${text}</a>`
          )
        }
        
        return <p key={`p-${index}`} className="my-2" dangerouslySetInnerHTML={{ __html: processed }} />
      }
      
      // Inline code
      if (line.includes('`')) {
        let processed = line
        const codeRegex = /`([^`]+)`/g
        let match
        
        while ((match = codeRegex.exec(line)) !== null) {
          const [fullMatch, code] = match
          processed = processed.replace(
            fullMatch,
            `<code class="bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono">${code}</code>`
          )
        }
        
        return <p key={`p-${index}`} className="my-2" dangerouslySetInnerHTML={{ __html: processed }} />
      }
      
      // Regular paragraph
      return <p key={`p-${index}`} className="my-2">{line}</p>
    })
  }

  // Lazily render content for better performance
  const getRenderedContent = (sectionId: string, content: string[]) => {
    if (!parsedSections[sectionId]) {
      const rendered = renderContent(content)
      setParsedSections(prev => ({ ...prev, [sectionId]: rendered }))
      return rendered
    }
    return parsedSections[sectionId]
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="text-center max-w-md mx-auto">
          <svg 
            className="animate-spin h-10 w-10 text-primary mx-auto mb-6" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <h2 className="text-2xl font-bold mb-4">Loading Documentation</h2>
          <p className="text-slate-400 mb-6">Please wait while we prepare the documentation...</p>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="max-w-md w-full mx-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-4">
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800 bg-black">
        <div className="container mx-auto flex justify-between items-center h-16 px-4">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="font-bold text-xl">Brisk Documentation</h1>
          </div>
          {/* Right side header area */}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          transition-transform duration-200 ease-in-out
          md:translate-x-0 md:relative absolute z-10
          w-72 shrink-0 border-r border-slate-800 bg-black
          overflow-y-auto h-[calc(100vh-4rem)]
        `}>
          <ScrollArea className="h-full">
            <div className="p-4">
              {/* Search */}
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="bg-slate-900 border-slate-700 text-white"
                />
                
                {searchResults.length > 0 && (
                  <div className="mt-2 bg-slate-900 rounded-md border border-slate-800 p-2">
                    <p className="text-xs text-slate-400 mb-2">Results ({searchResults.length})</p>
                    <div className="space-y-1">
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (result.subsectionId) {
                              handleSectionClick(result.subsectionId)
                            } else {
                              handleSectionClick(result.sectionId)
                            }
                          }}
                          className="w-full text-left p-2 rounded-md text-xs text-slate-300 hover:bg-slate-800"
                        >
                          {result.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Separator className="my-4 bg-slate-800" />
              
              <nav className="space-y-1">
                {sections.map((section) => (
                  <div key={section.id} className="mb-2">
                    <button
                      onClick={() => handleSectionClick(section.id)}
                      className={`
                        w-full text-left px-3 py-2 rounded-md text-sm flex justify-between items-center
                        ${activeSection === section.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}
                      `}
                    >
                      <span>{section.title}</span>
                      {activeSection === section.id && <ChevronRight size={16} />}
                    </button>
                    
                    {section.subsections && section.subsections.length > 0 && activeSection === section.id && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-slate-800 pl-3">
                        {section.subsections.map((subsection) => (
                          <button
                            key={subsection.id}
                            onClick={() => handleSectionClick(subsection.id)}
                            className="w-full text-left px-2 py-1.5 rounded-md text-sm text-slate-400 hover:text-white hover:bg-slate-900"
                          >
                            {subsection.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </ScrollArea>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-black">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="container max-w-4xl mx-auto py-8 px-6">
              {/* Introduction */}
              {introduction.length > 0 && (
                <div className="mb-12 prose prose-invert max-w-none">
                  <h1 className="text-4xl font-bold mb-6">{title}</h1>
                  {getRenderedContent('introduction', introduction)}
                </div>
              )}
              
              {/* Active section content */}
              {sections.map((section) => {
                if (activeSection === section.id) {
                  return (
                    <div key={section.id} className="prose prose-invert max-w-none prose-pre:bg-transparent">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold !m-0">{section.title}</h2>
                        <button 
                          onClick={() => copyUrl(section.id)}
                          className="group relative p-2 rounded-md hover:bg-slate-800" 
                          aria-label="Copy URL"
                        >
                          <span className="sr-only">Copy URL</span>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-md-heavy">
                            <path fillRule="evenodd" clipRule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path>
                          </svg>
                        </button>
                      </div>
                      {getRenderedContent(section.id, section.content)}
                    </div>
                  )
                }
                
                // Render subsection if active
                if (section.subsections) {
                  const activeSubsection = section.subsections.find(sub => sub.id === activeSection)
                  if (activeSubsection) {
                    return (
                      <div key={activeSubsection.id} className="prose prose-invert max-w-none prose-pre:bg-transparent">
                        <div className="mb-4">
                          <button 
                            onClick={() => handleSectionClick(section.id)}
                            className="text-sm text-slate-400 hover:text-white flex items-center"
                          >
                            <ChevronRight size={16} className="rotate-180 mr-1" />
                            Back to {section.title}
                          </button>
                        </div>
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-3xl font-bold !m-0">{activeSubsection.title}</h2>
                          <button 
                            onClick={() => copyUrl(activeSubsection.id)}
                            className="group relative p-2 rounded-md hover:bg-slate-800" 
                            aria-label="Copy URL"
                          >
                            <span className="sr-only">Copy URL</span>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-md-heavy">
                              <path fillRule="evenodd" clipRule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path>
                            </svg>
                          </button>
                        </div>
                        {getRenderedContent(activeSubsection.id, activeSubsection.content)}
                      </div>
                    )
                  }
                }
                
                return null
              })}
            </div>
          </ScrollArea>
        </main>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-slate-800 bg-black py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              Built by Qbits. All rights reserved.
            </p>
            {/* Footer links can be added here if needed */}
          </div>
        </div>
      </footer>
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 bg-green-700 text-white px-4 py-2 rounded-md shadow-lg flex items-center">
          <Check size={16} className="mr-2" />
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default DocsPage
