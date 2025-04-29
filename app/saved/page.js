'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function SavedIdeas() {
  const router = useRouter();
  const [savedProjects, setSavedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const storedSavedProjects = localStorage.getItem('savedProjects');
    if (storedSavedProjects) {
      setSavedProjects(JSON.parse(storedSavedProjects));
    }
    setLoading(false);
  }, []);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
      setTimeout(() => setToast({ show: false, message: '' }), 300);
    }, 3000);
  };

  const handleRemove = (projectToRemove) => {
    const updatedProjects = savedProjects.filter(project => project.title !== projectToRemove.title);
    setSavedProjects(updatedProjects);
    localStorage.setItem('savedProjects', JSON.stringify(updatedProjects));
    showToast('Project removed from saved ideas');
    setSelectedProject(null);
  };

  const handleExport = (idea) => {
    const markdown = `# ${idea.title}

## Description
${idea.description}

## Tech Stack
${idea.stack.join(', ')}

## Getting Started
1. Clone the repository
2. Install dependencies
3. Start the development server

## Next Steps
- [ ] Set up the project structure
- [ ] Implement core features
- [ ] Add styling and UI components
- [ ] Test and deploy
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${idea.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredProjects = savedProjects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.stack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <span>Loading your saved ideas...</span>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Your Saved Projects</h1>
            <p className={styles.subtitle}>All your favorite project ideas in one place</p>
          </div>
          <div className={styles.controls}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search saved projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>
            <button 
              onClick={() => router.push('/select/suggestions')}
              className={styles.browseButton}
            >
              <span className={styles.browseIcon}>➕</span>
              Browse More Ideas
            </button>
          </div>
        </div>
        
        {savedProjects.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📚</div>
            <h2>No Saved Projects Yet</h2>
            <p>Start saving your favorite project ideas to see them here!</p>
            <button 
              onClick={() => router.push('/select/suggestions')}
              className={styles.ctaButton}
            >
              Browse Project Ideas
            </button>
          </div>
        ) : (
          <div className={styles.content}>
            <div className={styles.projectsList}>
              {filteredProjects.map((project, index) => (
                <div 
                  key={`${project.title}-${index}`} 
                  className={`${styles.projectCard} ${selectedProject?.title === project.title ? styles.selected : ''}`}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className={styles.projectHeader}>
                    <h2 className={styles.projectTitle}>{project.title}</h2>
                    <span className={styles.category}>
                      {project.type ? project.type.charAt(0).toUpperCase() + project.type.slice(1) : 'Project'}
                    </span>
                  </div>
                  <p className={styles.projectDescription}>{project.description}</p>
                  <div className={styles.stackTags}>
                    {project.stack.slice(0, 3).map((tech, i) => (
                      <span key={i} className={styles.stackTag}>{tech}</span>
                    ))}
                    {project.stack.length > 3 && (
                      <span className={styles.moreTags}>+{project.stack.length - 3} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedProject && (
              <div className={styles.projectDetails}>
                <div className={styles.detailsHeader}>
                  <h2>{selectedProject.title}</h2>
                  <button 
                    className={styles.closeButton}
                    onClick={() => setSelectedProject(null)}
                  >
                    ✕
                  </button>
                </div>
                <div className={styles.detailsContent}>
                  <div className={styles.section}>
                    <h3>Description</h3>
                    <p>{selectedProject.description}</p>
                  </div>
                  <div className={styles.section}>
                    <h3>Tech Stack</h3>
                    <div className={styles.stackList}>
                      {selectedProject.stack.map((tech, i) => (
                        <span key={i} className={styles.techItem}>{tech}</span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.exportButton}
                      onClick={() => handleExport(selectedProject)}
                    >
                      Export as Markdown
                    </button>
                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemove(selectedProject)}
                    >
                      Remove from Saved
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {toast.show && (
          <div className={`${styles.toast} ${styles.success} ${!toast.show ? styles.toastHide : ''}`}>
            <span className={styles.toastIcon}>✓</span>
            <span className={styles.toastMessage}>{toast.message}</span>
          </div>
        )}
      </div>
    </main>
  );
} 