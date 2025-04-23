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
        <div className={styles.loading}>Loading saved ideas...</div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Your Saved Project Ideas</h1>
          <div className={styles.controls}>
            <input
              type="text"
              placeholder="Search saved projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
        
        {savedProjects.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No saved projects yet</h2>
            <p>Start saving your favorite project ideas to see them here!</p>
            <button 
              onClick={() => router.push('/suggestions')}
              className={styles.ctaButton}
            >
              Browse Project Ideas
            </button>
          </div>
        ) : (
          <div className={styles.projectsGrid}>
            {filteredProjects.map((project, index) => (
              <div key={`${project.title}-${index}`} className={styles.projectCard}>
                <div className={styles.projectHeader}>
                  <h2 className={styles.projectTitle}>{project.title}</h2>
                  <span className={styles.category}>
                    {project.type ? project.type.charAt(0).toUpperCase() + project.type.slice(1) : 'Project'}
                  </span>
                </div>
                
                <p className={styles.projectDescription}>{project.description}</p>
                
                <div className={styles.projectDetails}>
                  <div className={styles.stack}>
                    <h3>Tech Stack:</h3>
                    <div className={styles.stackTags}>
                      {project.stack.map((tech, i) => (
                        <span key={i} className={styles.stackTag}>{tech}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleExport(project)}
                  >
                    Export
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.removeButton}`}
                    onClick={() => handleRemove(project)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
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