const fs = require('fs');
let code = fs.readFileSync('src/components/PublicationsSection.tsx', 'utf8');

// 1. Remove BibtexModal import
code = code.replace("import { BibtexModal } from './BibtexModal';\n", "");

// 2. Add activeCitationDropdown state
code = code.replace("const [activeBibtexPub, setActiveBibtexPub] = useState<Publication | null>(null);", "const [activeCitationDropdown, setActiveCitationDropdown] = useState<string | null>(null);");

// 3. Add handleDownload logic
const handleDownloadCode = `
  const handleDownload = (format: string, publication: Publication) => {
    let content = '';
    let filename = '';
    let mimeType = 'text/plain';

    switch (format) {
      case 'BibTeX':
        content = publication.bibtex || \`@article{\${publication.authors.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}\${publication.year},\\n  title={\${publication.title}},\\n  author={\${publication.authors}},\\n  journal={\${publication.venue}},\\n  year={\${publication.year}},\\n  doi={\${publication.doi || ''}}\\n}\`;
        filename = 'citation.bib';
        break;
      case 'EndNote':
        content = \`%0 Journal Article\\n%A \${publication.authors}\\n%T \${publication.title}\\n%J \${publication.venue}\\n%D \${publication.year}\\n\${publication.doi ? \`%R \${publication.doi}\\n\` : ''}\`;
        filename = 'citation.enw';
        mimeType = 'application/x-endnote-refer';
        break;
      case 'RefMan':
        content = \`TY  - JOUR\\nAU  - \${publication.authors}\\nTI  - \${publication.title}\\nJO  - \${publication.venue}\\nPY  - \${publication.year}\\n\${publication.doi ? \`DO  - \${publication.doi}\\n\` : ''}ER  - \`;
        filename = 'citation.ris';
        mimeType = 'application/x-research-info-systems';
        break;
      case 'RefWorks':
        content = \`RT Journal Article\\nA1 \${publication.authors}\\nT1 \${publication.title}\\nJF \${publication.venue}\\nYR \${publication.year}\\n\`;
        filename = 'citation.txt';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setActiveCitationDropdown(null);
  };
`;

code = code.replace("const [isSyncing, setIsSyncing] = useState(false);", "const [isSyncing, setIsSyncing] = useState(false);\n" + handleDownloadCode);

// 4. Update Cite button and Dropdown
const oldCiteCode = `<div className="flex items-center space-x-3">
                        <button
                          onClick={() => setActiveBibtexPub(pub)}
                          className="inline-flex items-center space-x-1 text-indigo-600 hover:underline cursor-pointer font-medium"
                        >
                          <Quote className="w-3.5 h-3.5" />
                          <span>Cite</span>
                        </button>`;

const newCiteCode = `<div className="flex items-center space-x-3 relative">
                        <button
                          onClick={() => setActiveCitationDropdown(activeCitationDropdown === pub.id ? null : pub.id)}
                          className="inline-flex items-center space-x-1 text-indigo-600 hover:underline cursor-pointer font-medium"
                        >
                          <Quote className="w-3.5 h-3.5" />
                          <span>Cite</span>
                        </button>
                        
                        {activeCitationDropdown === pub.id && (
                          <div className="absolute bottom-full left-0 mb-2 w-56 bg-white border border-slate-200 shadow-xl rounded-lg py-2 z-50 overflow-hidden text-sm animate-fadeIn">
                            {/* Little triangle arrow pointing down */}
                            <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-white border-b border-r border-slate-200 transform rotate-45"></div>
                            <button
                              onClick={() => handleDownload('RefWorks', pub)}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2"
                            >
                              <ChevronRight className="w-3 h-3" />
                              <span>Save to Refworks</span>
                            </button>
                            <button
                              onClick={() => handleDownload('RefMan', pub)}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2"
                            >
                              <ChevronRight className="w-3 h-3" />
                              <span>Export citation to RIS</span>
                            </button>
                            <button
                              onClick={() => handleDownload('BibTeX', pub)}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2"
                            >
                              <ChevronRight className="w-3 h-3" />
                              <span>Export citation to BibTeX</span>
                            </button>
                            <button
                              onClick={() => handleDownload('RefWorks', pub)} // RefWorks output is plain text RIS equivalent commonly mapped to "text" in these menus or we can just output plain text citation
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center space-x-2"
                            >
                              <ChevronRight className="w-3 h-3" />
                              <span>Export citation to text</span>
                            </button>
                          </div>
                        )}`;

code = code.replace(oldCiteCode, newCiteCode);

// Add ChevronRight import
code = code.replace("ChevronDown,", "ChevronDown,\n  ChevronRight,");

// Remove BibTeX modal render
const oldModalCode = `{/* BibTeX Modal */}
      {activeBibtexPub && (
        <BibtexModal
          publication={activeBibtexPub}
          onClose={() => setActiveBibtexPub(null)}
        />
      )}`;
code = code.replace(oldModalCode, "");

fs.writeFileSync('src/components/PublicationsSection.tsx', code);
