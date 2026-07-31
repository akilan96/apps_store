import React, { useMemo, useState, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import initialSoftwareData from './data/softwareData.json'
import './styles.css'

const categories = ['Discover', 'Productivity', 'Design', 'Creator tools', 'Music', 'Social']

// Preset sample random images
const presetImages = [
  { name: 'User GitHub Image', url: 'https://github.com/akilan96/akilan96/blob/main/images%20(1).jpeg' },
  { name: 'Photoshop', url: 'https://cdn-icons-png.flaticon.com/512/5968/5968520.png' },
  { name: 'VS Code', url: 'https://cdn-icons-png.flaticon.com/512/906/906324.png' },
  { name: 'Chrome', url: 'https://cdn-icons-png.flaticon.com/512/888/888846.png' },
  { name: 'Spotify', url: 'https://cdn-icons-png.flaticon.com/512/174/174872.png' }
]

// Helper to format image URLs
const getImgSrc = (url) => {
  if (!url) return ''
  let cleaned = url.trim()
  
  if (cleaned.includes('github.com') && cleaned.includes('/blob/')) {
    if (!cleaned.includes('?raw=true')) {
      cleaned = cleaned + '?raw=true'
    }
  }

  if (cleaned.startsWith('http') || cleaned.startsWith('data:') || cleaned.startsWith('/')) {
    return cleaned
  }
  return '/' + cleaned
}

// Pagination items generator for 1 2 3 ... lastPage format
const getPaginationItems = (current, total) => {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  
  const pages = []
  if (current <= 3) {
    pages.push(1, 2, 3, '...', total)
  } else if (current >= total - 2) {
    pages.push(1, '...', total - 2, total - 1, total)
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total)
  }
  return pages
}

function App() {
  const [currentPage, setCurrentPage] = useState('discover') // 'discover' | 'collections' | 'about' | 'add_software_113' | 'remove_software_113' | 'edit_software_113'
  const [active, setActive] = useState('Discover')
  const [query, setQuery] = useState('')
  const [installed, setInstalled] = useState([])
  const [notice, setNotice] = useState('')

  // Full Software Apps list loaded ONLY from softwareData.json
  const [appsList, setAppsList] = useState(initialSoftwareData)

  // Track deleted software titles in memory
  const [deletedTitles, setDeletedTitles] = useState([])

  // Active available apps
  const availableApps = useMemo(() => {
    return appsList.filter(a => !deletedTitles.includes(a.title))
  }, [appsList, deletedTitles])

  // Add Software 113 form state
  const [newTitle, setNewTitle] = useState('')
  const [newMaker, setNewMaker] = useState('')
  const [newCategory, setNewCategory] = useState('Productivity')
  const [newColor, setNewColor] = useState('#6876f8')
  const [newIconUrl, setNewIconUrl] = useState('')
  const [newHeading, setNewHeading] = useState('NEW RELEASE')

  // Edit Software 113 search & selection state
  const [editSearch, setEditSearch] = useState('')
  const [editTargetTitle, setEditTargetTitle] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editMaker, setEditMaker] = useState('')
  const [editCategory, setEditCategory] = useState('Productivity')
  const [editColor, setEditColor] = useState('#6876f8')
  const [editIconUrl, setEditIconUrl] = useState('')
  const [editHeading, setEditHeading] = useState('POPULAR')
  const [editRating, setEditRating] = useState('4.9')
  const [editDownloads, setEditDownloads] = useState('5.0M')

  // Filtered apps for Edit search
  const matchingEditApps = useMemo(() => {
    if (!editSearch.trim()) return appsList
    return appsList.filter(a => 
      `${a.title} ${a.maker} ${a.category}`.toLowerCase().includes(editSearch.toLowerCase())
    )
  }, [appsList, editSearch])

  // Remove Software 113 search query
  const [removeSearch, setRemoveSearch] = useState('')
  
  // Theme state saved in localStorage
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('bytebase_theme') || 'dark' } catch { return 'dark' }
  })

  // User details saved in localStorage - ONLY STORES FIRST LETTER OF USER NAME
  const [userInitial, setUserInitial] = useState(() => {
    try {
      return localStorage.getItem('bytebase_user_initial') || ''
    } catch { return '' }
  })

  const [inputUserName, setInputUserName] = useState('')

  // Onboarding Modal (shows on first open if no user initial saved)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      const saved = localStorage.getItem('bytebase_user_initial')
      return !saved
    } catch { return true }
  })

  const [showProfileModal, setShowProfileModal] = useState(false)

  // Discover Auto Pagination state
  const [discoverPage, setDiscoverPage] = useState(1)

  // Collections Pagination state
  const [collQuery, setCollQuery] = useState('')
  const [collCategory, setCollCategory] = useState('All')
  const [collPage, setCollPage] = useState(1)
  const pageSize = 4

  const resultsRef = useRef(null)

  // Populate Edit form when editTargetTitle changes
  useEffect(() => {
    if (!editTargetTitle) {
      if (appsList.length > 0) {
        const first = appsList[0]
        setEditTargetTitle(first.title)
        setEditTitle(first.title)
        setEditMaker(first.maker || '')
        setEditCategory(first.category || 'Productivity')
        setEditColor(first.color || '#6876f8')
        setEditIconUrl(first.iconUrl || '')
        setEditHeading(first.heading || 'POPULAR')
        setEditRating(first.rating || '4.9')
        setEditDownloads(first.downloads || '1.0M')
      }
    } else {
      const found = appsList.find(a => a.title === editTargetTitle)
      if (found) {
        setEditTitle(found.title)
        setEditMaker(found.maker || '')
        setEditCategory(found.category || 'Productivity')
        setEditColor(found.color || '#6876f8')
        setEditIconUrl(found.iconUrl || '')
        setEditHeading(found.heading || 'POPULAR')
        setEditRating(found.rating || '4.9')
        setEditDownloads(found.downloads || '1.0M')
      }
    }
  }, [editTargetTitle, appsList])

  // Listen to window location hash for secret routes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'add_software_113') {
        setCurrentPage('add_software_113')
      } else if (hash === 'remove_software_113') {
        setCurrentPage('remove_software_113')
      } else if (hash === 'edit_software_113') {
        setCurrentPage('edit_software_113')
      } else if (hash === 'collections') {
        setCurrentPage('collections')
      } else if (hash === 'about') {
        setCurrentPage('about')
      } else if (hash === 'discover') {
        setCurrentPage('discover')
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const profileDisplayLetter = useMemo(() => {
    return userInitial ? userInitial.toUpperCase() : 'A'
  }, [userInitial])

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      try { localStorage.setItem('bytebase_theme', next) } catch {}
      return next
    })
  }

  // Save ONLY the first letter of user's name in localStorage
  const saveUserInitialOnly = (nameStr) => {
    const trimmed = nameStr.trim()
    const firstLetter = trimmed ? trimmed[0].toUpperCase() : 'A'
    setUserInitial(firstLetter)
    try {
      localStorage.setItem('bytebase_user_initial', firstLetter)
    } catch (e) {
      console.error(e)
    }
    setShowOnboarding(false)
    setShowProfileModal(false)
  }

  const handleAddSoftware = (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const item = {
      title: newTitle.trim(),
      maker: newMaker.trim() || 'Official Publisher',
      category: newCategory,
      color: newColor,
      heading: newHeading.trim() || 'NEW RELEASE',
      iconUrl: newIconUrl.trim() || '',
      rating: '5.0',
      downloads: '1.0k'
    }

    setDeletedTitles(prev => prev.filter(t => t !== item.title))
    setAppsList([item, ...appsList.filter(a => a.title !== item.title)])

    setNotice(`Added "${item.title}"! Software published successfully`)
    setNewTitle('')
    setNewMaker('')
    setNewIconUrl('')
    setTimeout(() => setNotice(''), 3500)
  }

  const handleEditSoftware = (e) => {
    e.preventDefault()
    if (!editTargetTitle) return

    setAppsList(prev => prev.map(a => {
      if (a.title === editTargetTitle) {
        return {
          ...a,
          title: editTitle.trim() || a.title,
          maker: editMaker.trim() || a.maker,
          category: editCategory,
          color: editColor,
          iconUrl: editIconUrl.trim(),
          heading: editHeading.trim() || 'POPULAR',
          rating: editRating.trim() || '4.9',
          downloads: editDownloads.trim() || '1.0M'
        }
      }
      return a
    }))

    setNotice(`✓ Updated "${editTitle}" in software catalog!`)
    setTimeout(() => setNotice(''), 3500)
  }

  const handleDeleteSoftware = (title) => {
    setDeletedTitles(prev => [...prev, title])
    setNotice(`✓ Removed "${title}" from software directory.`)
    setTimeout(() => setNotice(''), 3000)
  }

  const handleRestoreSoftware = (title) => {
    setDeletedTitles(prev => prev.filter(t => t !== title))
    setNotice(`✓ Restored "${title}" back to software directory.`)
    setTimeout(() => setNotice(''), 3000)
  }

  // DOWNLOAD SOFTWARE - FETCHES installation_setup.zip WITH VERCEL COMPATIBILITY
  const downloadSoftware = (title) => {
    setInstalled(x => [...x, title])
    const zipFileName = `${title}_setup.zip`
    setNotice(`Downloading ${zipFileName}...`)

    fetch('/assets/installation_setup.zip')
      .then(res => {
        if (!res.ok) throw new Error('File fetch failed')
        return res.blob()
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = zipFileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setNotice(`✓ Downloaded ${zipFileName}`)
      })
      .catch((err) => {
        console.error(err)
        const a = document.createElement('a')
        a.href = '/assets/installation_setup.zip'
        a.download = zipFileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      })

    setTimeout(() => setNotice(''), 3500)
  }

  // Filtered list for Discover
  const filtered = useMemo(() => availableApps.filter(a => 
    (active === 'Discover' || a.category === active) && 
    `${a.title} ${a.maker} ${a.category}`.toLowerCase().includes(query.toLowerCase())
  ), [availableApps, active, query])

  // Discover Auto Pagination
  const discoverTotalPages = Math.ceil(filtered.length / pageSize) || 1

  const paginatedDiscoverApps = useMemo(() => {
    const start = (discoverPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, discoverPage, pageSize])

  // Collections Pagination
  const collFiltered = useMemo(() => availableApps.filter(a =>
    (collCategory === 'All' || a.category === collCategory) &&
    `${a.title} ${a.maker} ${a.category}`.toLowerCase().includes(collQuery.toLowerCase())
  ), [availableApps, collCategory, collQuery])

  const collTotalPages = Math.ceil(collFiltered.length / pageSize) || 1

  const paginatedCollApps = useMemo(() => {
    const start = (collPage - 1) * pageSize
    return collFiltered.slice(start, start + pageSize)
  }, [collFiltered, collPage, pageSize])

  // Remove software filtered list
  const removeFilteredApps = useMemo(() => appsList.filter(a => 
    `${a.title} ${a.maker} ${a.category}`.toLowerCase().includes(removeSearch.toLowerCase())
  ), [appsList, removeSearch])

  const handleCollCategory = (cat) => {
    setCollCategory(cat)
    setCollPage(1)
  }

  const handleCollQuery = (e) => {
    setCollQuery(e.target.value)
    setCollPage(1)
  }

  const scrollToResults = () => {
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        document.getElementById('all')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 40)
  }

  const handleCategorySelect = (cat) => {
    setActive(cat)
    setDiscoverPage(1)
    scrollToResults()
  }

  const handleDiscoverQueryChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setDiscoverPage(1)
    if (val.trim().length > 0) {
      scrollToResults()
    }
  }

  const clearSearch = () => {
    setQuery('')
    setActive('Discover')
    setDiscoverPage(1)
  }

  const navigateTo = (page, hashStr) => {
    setCurrentPage(page)
    window.location.hash = hashStr || page
  }

  return (
    <main className={`app-container ${theme}`}>
      <div className="orb orb-one"/><div className="orb orb-two"/>
      
      {/* Navigation */}
      <nav>
        <a className="brand" href="#discover" onClick={(e) => { e.preventDefault(); navigateTo('discover', 'discover'); }}>
          <span>◒</span> PcApps
        </a>
        <div className="navlinks">
          <a className={currentPage === 'discover' ? 'selected' : ''} href="#discover" onClick={(e) => { e.preventDefault(); navigateTo('discover', 'discover'); }}>
            Browse
          </a>
          <a className={currentPage === 'collections' ? 'selected' : ''} href="#collections" onClick={(e) => { e.preventDefault(); navigateTo('collections', 'collections'); }}>
            All Softwares
          </a>
          <a className={currentPage === 'about' ? 'selected' : ''} href="#about" onClick={(e) => { e.preventDefault(); navigateTo('about', 'about'); }}>
            About
          </a>
        </div>
        <div className="navright">
          <button className="sun" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
            {theme === 'dark' ? '☼' : '☾'}
          </button>
          <button className="profile" onClick={() => setShowProfileModal(true)} title="Click to edit profile">
            {profileDisplayLetter}
          </button>
        </div>
      </nav>

      {/* DISCOVER PAGE */}
      {currentPage === 'discover' && (
        <>
          <section className="hero" id="top">
            <div className="eyebrow"><i/> SOFTWARE, ORGANIZED</div>
            <h1>Find the tools where<br/><em>Fully Premium Activated.</em></h1>
            <p>One clean place to discover desktop software, compare releases, and get the <strong>official download.</strong></p>
            
            <form className="search-box-wrapper" onSubmit={(e) => { e.preventDefault(); scrollToResults(); }}>
              <div className="search">
                <span className="search-icon" onClick={scrollToResults} title="Click to view search results">⌕</span>
                <input 
                  value={query} 
                  onChange={handleDiscoverQueryChange}
                  placeholder="Search software, releases, or categories"
                />
                {query && (
                  <button type="button" className="clear-btn" onClick={clearSearch}>✕</button>
                )}
                <button type="submit" className="search-submit-btn" onClick={scrollToResults}>Search</button>
              </div>
              
              <div className="quick-search-options">
                <span className="quick-label">Search options:</span>
                {categories.map(c => (
                  <button 
                    type="button" 
                    key={c} 
                    className={`quick-chip ${active === c && !query ? 'active' : ''}`}
                    onClick={() => handleCategorySelect(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </form>

            <div className="hero-meta">
              <span><strong>20+</strong> software listings</span>
              <span><strong>Fresh</strong> release notes</span>
              <span><strong>Verified</strong> sources</span>
            </div>
          </section>

          {!query && active === 'Discover' && (
            <section className="feature" id="discover">
              <div className="feature-copy">
                <div className="eyebrow pink"><i/> TOP DOWNLOAD THIS WEEK</div>
                <h2>Meet <em>Adobe Photoshop.</em><br/>Create without<br/>limits.</h2>
                <p>A clean listing with its latest release details, compatibility information, and an official source link.</p>
                <div className="feature-actions">
                  <button className="primary" onClick={()=>downloadSoftware('Adobe Photoshop')}>
                    {installed.includes('Adobe Photoshop') ? '✓ Downloaded Photoshop' : 'Download Photoshop'} <span>↓</span>
                  </button>
                  <button className="round">▶</button>
                  <span>Release overview</span>
                </div>
                <div className="score">
                  <div className="icon arc" style={{background: '#31a8ff'}}>Ps</div>
                  <div><strong>4.9 <small>★★★★★</small></strong><p>15M ratings</p></div>
                  <div><strong>v25.0</strong><p>Latest release</p></div>
                  <div><strong>2.1 <small>GB</small></strong><p>Windows 10+</p></div>
                </div>
              </div>
              <div className="feature-art">
                <div className="planet">
                  <div className="window">
                    <div className="dots">● ● ●</div>
                    <div className="tabs"><b>Latest</b><span>Versions</span><span>Reviews</span></div>
                    <div className="cards"><div/><div/><div/></div>
                    <div className="feed">
                      <span>OFFICIAL RELEASE · WINDOWS</span>
                      <b>Adobe Photoshop 2024</b>
                      <p>Version notes, requirements, screenshots, and the publisher link.</p>
                    </div>
                  </div>
                </div>
                <div className="arc-badge" style={{background: '#31a8ff'}}>Ps</div>
              </div>
            </section>
          )}

          <section className="catalogue" id="all" ref={resultsRef}>
            <div className="section-head">
              <div>
                <div className="eyebrow"><i/> SOFTWARE DIRECTORY</div>
                <h2>
                  {query ? <>Search Results for <em>"{query}"</em></> : active !== 'Discover' ? <>{active} <em>Software</em></> : <>Everything for your <em>desktop.</em></>}
                </h2>
              </div>
              {(query || active !== 'Discover') ? (
                <button className="reset-filter-btn" onClick={clearSearch}>Show All Software ✕</button>
              ) : (
                <a href="#all" onClick={(e) => { e.preventDefault(); scrollToResults(); }}>Browse all software <span>→</span></a>
              )}
            </div>

            <div className="chips">
              {categories.map(c => (
                <button 
                  onClick={() => handleCategorySelect(c)} 
                  className={active === c ? 'active' : ''} 
                  key={c}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="apps">
              {paginatedDiscoverApps.map((app) => (
                <article className="app-card" key={app.title}>
                  <div className="app-top">
                    <div className="app-icon" style={{background: app.color || '#6876f8', color: app.title === 'Notion' ? '#111' : 'white', overflow: 'hidden', padding: app.iconUrl ? 0 : undefined}}>
                      {app.iconUrl ? (
                        <img src={getImgSrc(app.iconUrl)} alt={app.title} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px'}} />
                      ) : (
                        app.title[0]?.toUpperCase()
                      )}
                    </div>
                    <button className="more">•••</button>
                  </div>
                  <div className="tag">LATEST · {(app.heading || 'RELEASE').toUpperCase()}</div>
                  <h3>{app.title}</h3>
                  <p>{app.maker} &nbsp; · &nbsp; Windows</p>
                  <div className="app-bottom">
                    <span>★ {app.rating || '4.9'} <small>({app.downloads || '1.0M'})</small></span>
                    <button onClick={() => downloadSoftware(app.title)}>
                      {installed.includes(app.title) ? 'Downloaded' : 'Download'}
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {paginatedDiscoverApps.length === 0 && (
              <div className="empty">
                <p>No software found for "{query}".</p>
                <button className="primary" style={{marginTop: 15}} onClick={clearSearch}>Reset search filters</button>
              </div>
            )}

            {/* Discover Auto Pagination (1 2 3 ... format) */}
            {discoverTotalPages > 1 && (
              <div className="pagination">
                <button 
                  disabled={discoverPage === 1} 
                  onClick={() => { setDiscoverPage(p => Math.max(1, p - 1)); scrollToResults(); }}
                  className="page-btn"
                >
                  ← Prev
                </button>
                
                <div className="page-numbers">
                  {getPaginationItems(discoverPage, discoverTotalPages).map((p, idx) => (
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="pagination-ellipsis">...</span>
                    ) : (
                      <button 
                        key={p} 
                        className={`page-num ${discoverPage === p ? 'active' : ''}`}
                        onClick={() => { setDiscoverPage(p); scrollToResults(); }}
                      >
                        {p}
                      </button>
                    )
                  ))}
                </div>

                <button 
                  disabled={discoverPage === discoverTotalPages} 
                  onClick={() => { setDiscoverPage(p => Math.min(discoverTotalPages, p + 1)); scrollToResults(); }}
                  className="page-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </section>
        </>
      )}

      {/* SECRET ROUTE: ADD SOFTWARE 113 (#add_software_113) */}
      {currentPage === 'add_software_113' && (
        <section className="add-software-page">
          <div className="collections-header">
            <div className="eyebrow pink"><i/> SECRET ROUTE: #add_software_113</div>
            <h1>Add New <em>Software</em></h1>
            <p>Paste any image URL (e.g. <strong>GitHub image URL</strong>) or local path. Image path can be left pending for later.</p>
          </div>

          <div className="add-software-grid">
            <form className="add-software-card" onSubmit={handleAddSoftware}>
              <h3>Software Details</h3>

              <div className="input-group">
                <label>Software Name *</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  placeholder="e.g. Photoshop" 
                  required 
                />
              </div>

              <div className="input-group">
                <label>Image Path / URL (Optional - leave empty for pending)</label>
                <input 
                  type="text" 
                  value={newIconUrl} 
                  onChange={e => setNewIconUrl(e.target.value)}
                  placeholder="Paste GitHub or Image URL (e.g. https://github.com/.../blob/main/image.png)"
                />
                
                <div style={{marginTop: 8}}>
                  <span style={{fontSize: 11, color: '#888', display: 'block', marginBottom: 6}}>Quick Test Presets (Click to test):</span>
                  <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
                    {presetImages.map(preset => (
                      <button 
                        type="button" 
                        key={preset.name}
                        className={`quick-chip ${newIconUrl === preset.url ? 'active' : ''}`}
                        style={{padding: '4px 10px', fontSize: 11}}
                        onClick={() => setNewIconUrl(preset.url)}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label>Publisher / Maker</label>
                <input 
                  type="text" 
                  value={newMaker} 
                  onChange={e => setNewMaker(e.target.value)} 
                  placeholder="e.g. Adobe Inc." 
                />
              </div>

              <div className="input-group">
                <label>Heading / Tag</label>
                <input 
                  type="text" 
                  value={newHeading} 
                  onChange={e => setNewHeading(e.target.value)} 
                  placeholder="e.g. EDITOR'S CHOICE" 
                />
              </div>

              <div className="input-group">
                <label>Category</label>
                <select 
                  className="custom-select"
                  value={newCategory} 
                  onChange={e => setNewCategory(e.target.value)}
                >
                  {categories.filter(c => c !== 'Discover').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Icon Background Color</label>
                <div className="color-swatches">
                  {['#6876f8', '#ff765c', '#1ed760', '#ebae4b', '#007acc', '#b267f5', '#ff6363', '#4a154b'].map(col => (
                    <button 
                      type="button" 
                      key={col} 
                      className={`color-dot ${newColor === col ? 'selected' : ''}`}
                      style={{background: col}}
                      onClick={() => setNewColor(col)}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="primary-btn" style={{marginTop: 15, width: '100%'}}>
                + Publish Software (add_software_113)
              </button>
            </form>

            <div className="add-software-preview">
              <h3>Live Preview</h3>
              <article className="app-card preview-card">
                <div className="app-top">
                  <div className="app-icon" style={{background: newColor, color: '#fff', overflow: 'hidden', padding: newIconUrl ? 0 : undefined}}>
                    {newIconUrl ? (
                      <img src={getImgSrc(newIconUrl)} alt="Preview Icon" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px'}} />
                    ) : (
                      newTitle[0]?.toUpperCase() || 'A'
                    )}
                  </div>
                  <button className="more">•••</button>
                </div>
                <div className="tag">LATEST · {newHeading.toUpperCase()}</div>
                <h3>{newTitle || 'Software Name'}</h3>
                <p>{newMaker || 'Publisher'} &nbsp; · &nbsp; Windows</p>
                <div className="app-bottom">
                  <span>★ 5.0 <small>(1.0k)</small></span>
                  <button type="button" onClick={() => downloadSoftware(newTitle || 'Software')}>
                    Download
                  </button>
                </div>
              </article>
              <div className="preview-tip">
                ✓ Image URL is optional! You can add/edit image paths anytime later via <strong>#edit_software_113</strong>.
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECRET ROUTE: EDIT SOFTWARE 113 WITH SEARCHABLE SELECTOR (#edit_software_113) */}
      {currentPage === 'edit_software_113' && (
        <section className="add-software-page">
          <div className="collections-header">
            <div className="eyebrow pink"><i/> SECRET ROUTE: #edit_software_113</div>
            <h1>Edit <em>Software Details</em></h1>
            <p>Search software by name to quickly select and edit its details.</p>
          </div>

          <div className="add-software-grid">
            <form className="add-software-card" onSubmit={handleEditSoftware}>
              <h3>Search &amp; Select Software</h3>

              <div className="input-group">
                <label>Search Software Name *</label>
                <input 
                  type="text" 
                  value={editSearch} 
                  onChange={e => setEditSearch(e.target.value)} 
                  placeholder="Type software name to search (e.g. Photoshop, Visio, MATLAB)..."
                />
                
                <div style={{marginTop: 10}}>
                  <span style={{fontSize: 11, color: '#888', display: 'block', marginBottom: 6}}>Matching Software (Click to select):</span>
                  <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', maxHeight: 150, overflowY: 'auto', padding: '2px 0'}}>
                    {matchingEditApps.map(app => (
                      <button 
                        type="button" 
                        key={app.title}
                        className={`quick-chip ${editTargetTitle === app.title ? 'active' : ''}`}
                        style={{padding: '5px 12px', fontSize: 12}}
                        onClick={() => setEditTargetTitle(app.title)}
                      >
                        {app.title} <small>({app.maker})</small>
                      </button>
                    ))}
                    {matchingEditApps.length === 0 && (
                      <span style={{fontSize: 12, color: '#f87171'}}>No software matched "{editSearch}"</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{background: '#181b28', padding: '8px 12px', borderRadius: 8, margin: '15px 0', border: '1px solid #2d3042', fontSize: 12, color: '#78d5a3'}}>
                Currently Selected: <strong>{editTargetTitle || 'None'}</strong>
              </div>

              <div className="input-group">
                <label>Software Name</label>
                <input 
                  type="text" 
                  value={editTitle} 
                  onChange={e => setEditTitle(e.target.value)} 
                  required
                />
              </div>

              <div className="input-group">
                <label>Publisher / Maker</label>
                <input 
                  type="text" 
                  value={editMaker} 
                  onChange={e => setEditMaker(e.target.value)} 
                />
              </div>

              <div className="input-group">
                <label>Image Icon Path / URL</label>
                <input 
                  type="text" 
                  value={editIconUrl} 
                  onChange={e => setEditIconUrl(e.target.value)}
                  placeholder="Paste GitHub image URL or leave blank for pending"
                />
                
                <div style={{marginTop: 8}}>
                  <span style={{fontSize: 11, color: '#888', display: 'block', marginBottom: 6}}>Quick Presets:</span>
                  <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
                    {presetImages.map(preset => (
                      <button 
                        type="button" 
                        key={preset.name}
                        className={`quick-chip ${editIconUrl === preset.url ? 'active' : ''}`}
                        style={{padding: '4px 10px', fontSize: 11}}
                        onClick={() => setNewIconUrl(preset.url)}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label>Category</label>
                <select 
                  className="custom-select"
                  value={editCategory} 
                  onChange={e => setEditCategory(e.target.value)}
                >
                  {categories.filter(c => c !== 'Discover').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Heading / Tag</label>
                <input 
                  type="text" 
                  value={editHeading} 
                  onChange={e => setEditHeading(e.target.value)} 
                />
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
                <div className="input-group">
                  <label>Rating</label>
                  <input 
                    type="text" 
                    value={editRating} 
                    onChange={e => setEditRating(e.target.value)} 
                  />
                </div>
                <div className="input-group">
                  <label>Downloads</label>
                  <input 
                    type="text" 
                    value={editDownloads} 
                    onChange={e => setEditDownloads(e.target.value)} 
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Icon Background Color</label>
                <div className="color-swatches">
                  {['#6876f8', '#ff765c', '#1ed760', '#ebae4b', '#007acc', '#b267f5', '#ff6363', '#4a154b'].map(col => (
                    <button 
                      type="button" 
                      key={col} 
                      className={`color-dot ${editColor === col ? 'selected' : ''}`}
                      style={{background: col}}
                      onClick={() => setEditColor(col)}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="primary-btn" style={{marginTop: 15, width: '100%'}}>
                ✓ Save Changes (edit_software_113)
              </button>
            </form>

            <div className="add-software-preview">
              <h3>Live Preview</h3>
              <article className="app-card preview-card">
                <div className="app-top">
                  <div className="app-icon" style={{background: editColor, color: '#fff', overflow: 'hidden', padding: editIconUrl ? 0 : undefined}}>
                    {editIconUrl ? (
                      <img src={getImgSrc(editIconUrl)} alt="Preview Icon" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px'}} />
                    ) : (
                      editTitle[0]?.toUpperCase() || 'A'
                    )}
                  </div>
                  <button className="more">•••</button>
                </div>
                <div className="tag">LATEST · {editHeading.toUpperCase()}</div>
                <h3>{editTitle || 'Software Name'}</h3>
                <p>{editMaker || 'Publisher'} &nbsp; · &nbsp; Windows</p>
                <div className="app-bottom">
                  <span>★ {editRating} <small>({editDownloads})</small></span>
                  <button type="button" onClick={() => downloadSoftware(editTitle || 'Software')}>
                    Download
                  </button>
                </div>
              </article>
              <div className="preview-tip">
                ✓ Edits update software details in JSON state for Discover and Collections pages!
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECRET ROUTE: REMOVE SOFTWARE 113 (#remove_software_113) */}
      {currentPage === 'remove_software_113' && (
        <section className="add-software-page">
          <div className="collections-header">
            <div className="eyebrow pink"><i/> SECRET ROUTE: #remove_software_113</div>
            <h1>Remove <em>Software</em></h1>
            <p>Select any software to delete it permanently from the directory.</p>
            
            <div className="search-box-wrapper" style={{marginTop: 25}}>
              <div className="search">
                <span className="search-icon">⌕</span>
                <input 
                  value={removeSearch} 
                  onChange={e => setRemoveSearch(e.target.value)}
                  placeholder="Search software to remove..."
                />
                {removeSearch && (
                  <button className="clear-btn" onClick={() => setRemoveSearch('')}>✕</button>
                )}
              </div>
            </div>
          </div>

          <div className="catalogue" style={{paddingTop: 30}}>
            <div className="apps">
              {removeFilteredApps.map((app) => {
                const isDeleted = deletedTitles.includes(app.title)
                return (
                  <article className={`app-card ${isDeleted ? 'deleted-card' : ''}`} key={app.title}>
                    <div className="app-top">
                      <div className="app-icon" style={{background: app.color || '#6876f8', color: app.title === 'Notion' ? '#111' : 'white', overflow: 'hidden', padding: app.iconUrl ? 0 : undefined}}>
                        {app.iconUrl ? (
                          <img src={getImgSrc(app.iconUrl)} alt={app.title} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px'}} />
                        ) : (
                          app.title[0]?.toUpperCase()
                        )}
                      </div>
                      <span className={`status-badge ${isDeleted ? 'status-deleted' : 'status-active'}`}>
                        {isDeleted ? 'DELETED' : 'ACTIVE'}
                      </span>
                    </div>
                    <div className="tag">CATEGORY · {app.category.toUpperCase()}</div>
                    <h3>{app.title}</h3>
                    <p>{app.maker} &nbsp; · &nbsp; Windows</p>
                    <div className="app-bottom" style={{marginTop: 20}}>
                      {isDeleted ? (
                        <button className="restore-btn" onClick={() => handleRestoreSoftware(app.title)}>
                          ↺ Restore
                        </button>
                      ) : (
                        <button className="delete-btn" onClick={() => handleDeleteSoftware(app.title)}>
                          🗑 Delete Software
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>

            {removeFilteredApps.length === 0 && (
              <div className="empty">
                <p>No software matched "{removeSearch}".</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ALL SOFTWARES PAGE (FORMERLY COLLECTIONS) WITH PAGINATION */}
      {currentPage === 'collections' && (
        <section className="collections-page">
          <div className="collections-header">
            <div className="eyebrow"><i/> CURATED CATALOG</div>
            <h1>All <em>Softwares</em></h1>
            <p>Explore our full catalog with search and pagination.</p>
            
            <div className="search-box-wrapper" style={{marginTop: 25}}>
              <div className="search">
                <span className="search-icon">⌕</span>
                <input 
                  value={collQuery} 
                  onChange={handleCollQuery}
                  placeholder="Search all softwares by title or maker..."
                />
                {collQuery && (
                  <button className="clear-btn" onClick={() => { setCollQuery(''); setCollPage(1); }}>✕</button>
                )}
              </div>
            </div>

            <div className="chips" style={{justifyContent: 'center', marginTop: 25}}>
              {['All', 'Productivity', 'Design', 'Creator tools', 'Music', 'Social'].map(c => (
                <button 
                  key={c} 
                  className={collCategory === c ? 'active' : ''}
                  onClick={() => handleCollCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="catalogue" style={{paddingTop: 0}}>
            <div className="apps">
              {paginatedCollApps.map((app) => (
                <article className="app-card" key={app.title}>
                  <div className="app-top">
                    <div className="app-icon" style={{background: app.color || '#6876f8', color: app.title === 'Notion' ? '#111' : 'white', overflow: 'hidden', padding: app.iconUrl ? 0 : undefined}}>
                      {app.iconUrl ? (
                        <img src={getImgSrc(app.iconUrl)} alt={app.title} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px'}} />
                      ) : (
                        app.title[0]?.toUpperCase()
                      )}
                    </div>
                    <button className="more">•••</button>
                  </div>
                  <div className="tag">LATEST · {(app.heading || 'RELEASE').toUpperCase()}</div>
                  <h3>{app.title}</h3>
                  <p>{app.maker} &nbsp; · &nbsp; Windows</p>
                  <div className="app-bottom">
                    <span>★ {app.rating || '4.9'} <small>({app.downloads || '1.0M'})</small></span>
                    <button onClick={() => downloadSoftware(app.title)}>
                      {installed.includes(app.title) ? 'Downloaded' : 'Download'}
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {paginatedCollApps.length === 0 && (
              <div className="empty">
                <p>No software matched your search in All Softwares.</p>
                <button className="primary" style={{marginTop: 15}} onClick={() => { setCollQuery(''); setCollCategory('All'); setCollPage(1); }}>
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination Controls (1 2 3 ... format) */}
            {collTotalPages > 1 && (
              <div className="pagination">
                <button 
                  disabled={collPage === 1} 
                  onClick={() => setCollPage(p => Math.max(1, p - 1))}
                  className="page-btn"
                >
                  ← Prev
                </button>
                
                <div className="page-numbers">
                  {getPaginationItems(collPage, collTotalPages).map((p, idx) => (
                    p === '...' ? (
                      <span key={`coll-ellipsis-${idx}`} className="pagination-ellipsis">...</span>
                    ) : (
                      <button 
                        key={p} 
                        className={`page-num ${collPage === p ? 'active' : ''}`}
                        onClick={() => setCollPage(p)}
                      >
                        {p}
                      </button>
                    )
                  ))}
                </div>

                <button 
                  disabled={collPage === collTotalPages} 
                  onClick={() => setCollPage(p => Math.min(collTotalPages, p + 1))}
                  className="page-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ABOUT PAGE */}
      {currentPage === 'about' && (
        <section className="about-page">
          <div className="eyebrow"><i/> ABOUT PCAPPS</div>
          <h1>Empowering your <em>desktop workflow.</em></h1>
          <p className="about-subtitle">PcApps is a modern, verified directory designed to make discovering and downloading desktop applications effortless and secure.</p>
          
          <div className="about-grid">
            <div className="about-card">
              <h3> Verified Sources</h3>
              <p>Every software listing comes directly from official developer releases and verified repositories.</p>
            </div>
            <div className="about-card">
              <h3>⚡ High Speed Access</h3>
              <p>Direct official downloads with release notes, system requirements, and update notifications.</p>
            </div>
            <div className="about-card">
              <h3> Clean Experience</h3>
              <p>No malware, no bundlers, no fake download buttons — just clean, elegant software distribution.</p>
            </div>
          </div>

          <div style={{marginTop: 40}}>
            <button className="primary" onClick={() => navigateTo('discover', 'discover')}>
              Back to Browse →
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer>
        <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); navigateTo('discover', 'discover'); }}>
          <span>◒</span> PcApps
        </a>
        <p>© 2026 PcApps &nbsp; · &nbsp; Windows cracked software directory</p>
      </footer>

      {notice && <div className="toast">✓ &nbsp;{notice}</div>}

      {/* FIRST VISIT ONBOARDING MODAL */}
      {showOnboarding && (
        <div className="modal-overlay">
          <div className="modal-content onboarding-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Welcome to PcApps ◒</h3>
            </div>
            <div className="modal-body">
              <p className="onboarding-text">Please enter your name to set up your profile initial.</p>
              
              <form onSubmit={(e) => { e.preventDefault(); saveUserInitialOnly(inputUserName); }}>
                <div className="input-group">
                  <label>Your Name</label>
                  <input 
                    type="text"
                    value={inputUserName} 
                    onChange={e => setInputUserName(e.target.value)} 
                    placeholder="e.g. John"
                    required
                  />
                </div>
                <div className="modal-footer" style={{marginTop: 25}}>
                  <button type="submit" className="primary-btn" style={{width: '100%'}}>
                    Begin Setup & Continue →
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* USER PROFILE MODAL */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Profile</h3>
              <button className="close-btn" onClick={() => setShowProfileModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="profile-preview">
                <div className="profile-large">{profileDisplayLetter}</div>
                <p>Profile Initial: <strong>{profileDisplayLetter}</strong></p>
              </div>
              <div className="input-group">
                <label>Your Name (Only 1st Letter Stored)</label>
                <input 
                  type="text"
                  value={inputUserName} 
                  onChange={e => setInputUserName(e.target.value)} 
                  placeholder="e.g. John"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="primary-btn" onClick={() => saveUserInitialOnly(inputUserName)}>
                Save Profile & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
