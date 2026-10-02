"""Bulk UI migration preserving the repository's complete historical project data."""
from pathlib import Path

path = Path("src/components/ProjectPortfolio.tsx")
text = path.read_text()
if "const ProjectCard:" not in text:
    print("Portfolio already migrated")
    raise SystemExit(0)
prefix = text.split("const ProjectCard:")[0]
prefix = prefix.replace("import React, { useState } from 'react';", "import React from 'react';")
prefix = prefix.replace("import { motion } from 'framer-motion';", "import Card3D from './Card3D';\nimport GoldVisual from './GoldVisual';")
prefix = prefix.replace(", PlayCircle, X", "")
prefix = prefix.replace("        videoFile: '/demo.mp4',\n", "")
prefix = prefix.replace("        videoFile: '/videos/converse-promo.mp4',\n", "")
prefix = prefix.replace("        videoFile: '/video-Prime.AI.webm',\n", "")
path.write_text(prefix + '''export default function ProjectPortfolio({ locale = 'en' }: { locale?: Locale }) {
    const fr = locale === 'fr';
    return <section className="intro">
        <p>{fr ? `${projects.length} archives. Descriptions anglaises non vérifiées. Aucun paiement.` : `${projects.length} archives. Unverified English descriptions. No payments.`}</p>
        <div className="info-grid">
            {projects.map(project => <Card3D key={project.id}>
                {project.videoFile ? <video controls playsInline preload="none" width="800" height="450" poster={project.image} aria-label={project.title}>
                    <source src={project.videoFile} />
                </video> : project.image ? <img src={project.image} alt={project.title} width="800" height="450" loading="lazy" /> : <GoldVisual />}
                <h2 lang="en" title={project.title}>{project.title.split(' ').slice(0, 4).join(' ')}</h2>
                <p>{fr ? "Archive illustrative · Source externe" : "Illustrative archive · External source"}</p>
                <details lang="en"><summary>{fr ? "Description (EN)" : "Description (EN)"}</summary><p>{project.description}</p><p>{project.tech.join(' · ')}</p></details>
                <div className="actions">
                    {project.link && <a href={project.link} target="_blank" rel="noopener noreferrer"><Github size={16} aria-hidden="true" /> {fr ? "Source" : "Source"}</a>}
                    {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">{fr ? "Externe, non vérifié" : "External, unverified"}</a>}
                </div>
            </Card3D>)}
        </div>
    </section>;
}
''')
