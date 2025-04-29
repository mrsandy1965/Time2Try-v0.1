'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const suggestedSkills = [
  'JavaScript', 'Python', 'React', 'Node.js', 'HTML/CSS',
  'TypeScript', 'Angular', 'Vue.js', 'Java', 'C++',
  'SQL', 'MongoDB', 'AWS', 'Docker', 'Git'
];

export default function Select() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    skills: [],
    time: '1-2',
  });

  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestedSkills.filter(skill => 
    skill.toLowerCase().includes(skillInput.toLowerCase()) &&
    !formData.skills.includes(skill)
  );

  const handleSkillAdd = (skillToAdd = skillInput) => {
    const trimmedSkill = skillToAdd.trim();
    if (trimmedSkill && !formData.skills.includes(trimmedSkill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, trimmedSkill]
      }));
      setSkillInput('');
      setError('');
      setShowSuggestions(false);
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.skills.length === 0) {
      setError('Please add at least one skill');
      return;
    }
    localStorage.setItem('selectedTechStack', JSON.stringify(formData.skills));
    router.push('/select/suggestions');
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.'+styles.skillsInput)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          <span>Let's Find Your Next</span>
          <span>Amazing Project</span>
          <small>✨ Turn Your Skills Into Reality ✨</small>
        </h1>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>What technologies/skills do you know? 🚀</label>
            <div className={styles.skillsInput}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => {
                    setSkillInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSkillAdd();
                    }
                  }}
                  placeholder="Enter a skill (e.g., React, Python, JavaScript)"
                  className={styles.input}
                />
                {showSuggestions && skillInput && filteredSuggestions.length > 0 && (
                  <div className={styles.suggestions}>
                    {filteredSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className={styles.suggestionItem}
                        onClick={() => handleSkillAdd(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleSkillAdd()}
                className={styles.addButton}
              >
                Add
              </button>
            </div>
            <div className={styles.skillTags}>
              {formData.skills.map((skill) => (
                <span 
                  key={skill} 
                  className={styles.skillTag}
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleSkillRemove(skill)}
                    className={styles.removeSkill}
                    aria-label="Remove skill"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>How many hours can you dedicate? ⏰</label>
            <select
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className={styles.select}
            >
              <option value="1-2">1-2 hours</option>
              <option value="3-5">3-5 hours</option>
              <option value="6-10">6-10 hours</option>
              <option value="11-15">11-15 hours</option>
            </select>
          </div>

          <button type="submit" className={styles.submitButton}>
            Generate Ideas
          </button>
        </form>
      </div>
    </main>
  );
} 