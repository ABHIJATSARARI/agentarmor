#!/usr/bin/env python3
"""Generate Srapid_Deck.pdf -- AgentArmor Hackathon Submission Document"""

from fpdf import FPDF
import os

LOGO_PATH = "/Users/abhijat/Downloads/plot/agentarmor/logo.png"
OUTPUT_PATH = "/Users/abhijat/Downloads/plot/agentarmor/Srapid_Deck.pdf"

# Colors
NAVY = (6, 11, 24)
DARK_BG = (12, 20, 37)
CYAN = (0, 240, 255)
PURPLE = (168, 85, 247)
GREEN = (0, 255, 136)
RED = (255, 51, 102)
AMBER = (255, 170, 0)
WHITE = (240, 244, 248)
GRAY = (136, 153, 180)
LIGHT_BORDER = (30, 42, 66)
TABLE_ROW_ALT = (15, 25, 45)

class SrapidDeck(FPDF):
    def __init__(self):
        super().__init__('P', 'mm', 'A4')
        self.set_auto_page_break(auto=True, margin=20)

    def header(self):
        if self.page_no() > 1:
            self.set_fill_color(*NAVY)
            self.rect(0, 0, 210, 12, 'F')
            self.set_font('Helvetica', 'B', 7)
            self.set_text_color(*GRAY)
            self.set_xy(10, 3)
            self.cell(0, 6, 'AgentArmor  |  Team Srapid  |  Microsoft Build AI Hackathon 2025', align='L')
            self.set_xy(10, 3)
            self.cell(0, 6, f'Page {self.page_no()}', align='R')

    def footer(self):
        self.set_y(-12)
        self.set_font('Helvetica', '', 7)
        self.set_text_color(*GRAY)
        self.cell(0, 8, 'agentarmor.vercel.app  |  github.com/ABHIJATSARARI/agentarmor', align='C')

    def dark_page(self):
        self.set_fill_color(*NAVY)
        self.rect(0, 0, 210, 297, 'F')

    def section_title(self, num, title):
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(*CYAN)
        self.cell(0, 10, f'{num}. {title}', ln=True)
        # Underline
        self.set_draw_color(*CYAN)
        self.set_line_width(0.5)
        self.line(self.l_margin, self.get_y(), 200, self.get_y())
        self.ln(6)

    def body_text(self, text):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(*WHITE)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

    def bold_text(self, text):
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(*WHITE)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

    def quote_block(self, text):
        x = self.get_x()
        y = self.get_y()
        self.set_fill_color(20, 30, 55)
        self.set_draw_color(*CYAN)
        self.rect(self.l_margin, y, 180, 12, 'DF')
        self.set_line_width(0.8)
        self.line(self.l_margin, y, self.l_margin, y + 12)
        self.set_xy(self.l_margin + 4, y + 2)
        self.set_font('Helvetica', 'BI', 9)
        self.set_text_color(*CYAN)
        self.multi_cell(172, 4, text)
        self.set_xy(self.l_margin, y + 14)
        self.ln(2)

    def table(self, headers, rows, col_widths=None):
        if col_widths is None:
            col_widths = [180 / len(headers)] * len(headers)

        # Header row
        self.set_font('Helvetica', 'B', 8)
        self.set_fill_color(20, 30, 55)
        self.set_text_color(*CYAN)
        self.set_draw_color(*LIGHT_BORDER)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 8, h, border=1, fill=True, align='C')
        self.ln()

        # Data rows
        self.set_font('Helvetica', '', 8)
        self.set_text_color(*WHITE)
        for r_idx, row in enumerate(rows):
            if r_idx % 2 == 0:
                self.set_fill_color(*DARK_BG)
            else:
                self.set_fill_color(*TABLE_ROW_ALT)
            for i, cell in enumerate(row):
                self.cell(col_widths[i], 7, str(cell), border=1, fill=True, align='C' if i == 0 else 'L')
            self.ln()
        self.ln(4)

    def bullet(self, text, indent=15):
        self.set_x(self.l_margin + indent - 10)
        self.set_font('Helvetica', '', 9)
        self.set_text_color(*WHITE)
        self.cell(5, 5, chr(8226), ln=False)
        self.multi_cell(160, 5, text)

    def metric_box(self, label, value, color=CYAN):
        x = self.get_x()
        y = self.get_y()
        w = 42
        h = 20
        self.set_fill_color(15, 25, 45)
        self.set_draw_color(*color)
        self.rect(x, y, w, h, 'DF')
        # Value
        self.set_xy(x, y + 2)
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(*color)
        self.cell(w, 8, str(value), align='C')
        # Label
        self.set_xy(x, y + 10)
        self.set_font('Helvetica', '', 6)
        self.set_text_color(*GRAY)
        self.cell(w, 6, label, align='C')
        self.set_xy(x + w + 3, y)

def build_pdf():
    pdf = SrapidDeck()

    # === PAGE 1: COVER ===
    pdf.add_page()
    pdf.dark_page()

    # Logo
    if os.path.exists(LOGO_PATH):
        pdf.image(LOGO_PATH, x=70, y=30, w=70)
    
    # Title
    pdf.set_y(110)
    pdf.set_font('Helvetica', 'B', 36)
    pdf.set_text_color(*WHITE)
    pdf.cell(0, 15, 'AgentArmor', align='C', ln=True)

    pdf.set_font('Helvetica', '', 14)
    pdf.set_text_color(*GRAY)
    pdf.cell(0, 8, 'Immune System for AI Agents', align='C', ln=True)
    pdf.ln(6)

    # Tagline
    pdf.set_font('Helvetica', 'BI', 12)
    pdf.set_text_color(*CYAN)
    pdf.cell(0, 8, 'Attack one, defend all.', align='C', ln=True)
    pdf.ln(12)

    # Info table on cover
    pdf.set_x(45)
    info = [
        ('Team', 'Srapid'),
        ('Member', 'Abhijat (Solo Developer)'),
        ('Track', 'Security in the Agentic Future'),
        ('Live Demo', 'agentarmor.vercel.app'),
        ('GitHub', 'github.com/ABHIJATSARARI/agentarmor'),
    ]
    for label, val in info:
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(*CYAN)
        pdf.cell(30, 7, label, align='R')
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(*WHITE)
        pdf.cell(5, 7, '')
        pdf.cell(80, 7, val, ln=True)

    pdf.ln(10)
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(*GRAY)
    pdf.cell(0, 6, 'Microsoft Build AI Hackathon 2025', align='C', ln=True)

    # === PAGE 2: PROBLEM ===
    pdf.add_page()
    pdf.dark_page()
    pdf.set_y(18)

    pdf.section_title('1', 'Problem Statement')
    pdf.body_text(
        'AI agents are proliferating at an unprecedented rate -- browsing the web, processing emails, '
        'reviewing code, managing files, and making autonomous decisions. But this creates a massive '
        'cybersecurity blind spot.'
    )
    pdf.body_text(
        'Traditional security tools (firewalls, WAFs, antivirus) were designed for human-computer interaction. '
        'They cannot protect against the new class of attacks targeting AI agents.'
    )

    pdf.table(
        ['Threat', 'Description', 'Impact'],
        [
            ['Prompt Injection', 'Malicious instructions hidden in inputs', 'Agent leaks data, executes unintended actions'],
            ['Identity Spoofing', 'Attackers impersonating trusted agents', 'Unauthorized access, trust chain compromise'],
            ['Privilege Escalation', 'Agents tricked beyond their scope', 'System-level compromise from single breach'],
            ['Data Exfiltration', 'Sensitive data leaked via agent actions', 'PII leaks, IP theft'],
        ],
        [35, 70, 75]
    )

    pdf.quote_block('There is no standardized security framework for protecting AI agents.')

    # === SOLUTION ===
    pdf.section_title('2', 'Our Solution: AgentArmor')
    pdf.body_text(
        'AgentArmor is a three-layer biological immune system for AI agents, inspired by how the '
        'human body defends against pathogens.'
    )

    pdf.table(
        ['Layer', 'Name', 'Bio Analog', 'Function'],
        [
            ['1', 'Injection Firewall', 'Skin barrier', '5-strategy detection in < 2ms'],
            ['2', 'Behavioral System', 'Innate immunity', '6-dim fingerprint + anomaly detection'],
            ['3', 'Collective Immunity', 'Adaptive immunity', 'Honeypot traps + immune propagation'],
        ],
        [15, 40, 35, 90]
    )

    pdf.bold_text('Key Innovation: Collective Immunity')
    pdf.body_text(
        'When ONE agent is attacked, the attack signature is captured, analyzed, and propagated to ALL '
        'agents in the network -- providing instant collective immunity. Attack one, defend all.'
    )

    # === PAGE 3: ARCHITECTURE ===
    pdf.add_page()
    pdf.dark_page()
    pdf.set_y(18)

    pdf.section_title('3', 'Technical Architecture')

    # Architecture as text diagram
    pdf.set_font('Courier', '', 7)
    pdf.set_text_color(*GREEN)
    arch_lines = [
        '+-----------------------------------------------------------+',
        '|            React Dashboard (Vite + Canvas API)            |',
        '|  Agent Monitor | Threat Feed | Attack Console | Immune    |',
        '|  Pipeline      | Honeypot    | Risk Gauge     | Analytics |',
        '+----------------------------+------------------------------+',
        '                             | REST + WebSocket              ',
        '+----------------------------+------------------------------+',
        '|              Python FastAPI Backend                        |',
        '|  +-------------------------------------------------------+|',
        '|  |           Security Engine Pipeline                     ||',
        '|  |  Layer 1       |  Layer 2         |  Layer 3           ||',
        '|  |  Patterns      |  Fingerprint     |  Honeypot Agent    ||',
        '|  |  Encoding      |  Anomaly Det.    |  Immune Memory     ||',
        '|  |  Structure     |  Z-Score         |  Propagation       ||',
        '|  |  Entropy       |  Quarantine      |                    ||',
        '|  |  Zero-Width    |                  |                    ||',
        '|  +-------------------------------------------------------+|',
        '|  +-------------------------------------------------------+|',
        '|  |  Agent Simulator: 6 Live AI Agents                    ||',
        '|  |  WebCrawler | MailGuard | CodeSentry | DataMiner ...  ||',
        '|  +-------------------------------------------------------+|',
        '+-----------------------------------------------------------+',
    ]
    for line in arch_lines:
        pdf.cell(0, 3.5, line, ln=True)
    pdf.ln(6)

    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(*WHITE)
    pdf.cell(0, 6, 'Tech Stack', ln=True)
    pdf.table(
        ['Component', 'Technology'],
        [
            ['Backend', 'Python 3.11, FastAPI, Uvicorn, Pydantic'],
            ['Frontend', 'React 18, Vite 5, Canvas API'],
            ['Real-Time', 'WebSocket (native)'],
            ['Styling', 'Custom CSS (1,600+ lines, glassmorphism)'],
            ['Deployment', 'Vercel (frontend) + Render (backend)'],
        ],
        [40, 140]
    )

    # === PAGE 4: AI DEEP DIVE ===
    pdf.add_page()
    pdf.dark_page()
    pdf.set_y(18)

    pdf.section_title('4', 'AI Integration Deep Dive')

    pdf.bold_text('Layer 1: Multi-Strategy Prompt Injection Detection')
    pdf.body_text('Five detection strategies run in parallel on every input:')

    pdf.table(
        ['#', 'Strategy', 'What It Catches', 'Confidence'],
        [
            ['1', 'Pattern Matching', '30+ known injection phrases', '85-95%'],
            ['2', 'Encoding Detection', 'Base64, Unicode, HTML, hex payloads', '80-90%'],
            ['3', 'Structural Analysis', 'Imperative commands, role reassignment', '70-85%'],
            ['4', 'Entropy Analysis', 'Obfuscated payloads (Shannon entropy)', '65-80%'],
            ['5', 'Zero-Width Detection', 'Invisible Unicode steganography', '90-95%'],
        ],
        [10, 40, 75, 30]
    )

    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(*AMBER)
    pdf.cell(0, 6, 'Risk Score: R = min(100, Sum(wi * ci * 100))', ln=True)
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(*GRAY)
    pdf.cell(0, 5, 'where wi = strategy weight, ci = match confidence', ln=True)
    pdf.cell(0, 5, 'R < 30: CLEAN  |  30 <= R < 60: SUSPICIOUS  |  R >= 60: MALICIOUS', ln=True)
    pdf.ln(6)

    pdf.bold_text('Layer 2: Behavioral Fingerprinting & Anomaly Detection')
    pdf.body_text('Each agent maintains a 6-dimensional behavioral profile:')

    pdf.table(
        ['Dimension', 'Weight', 'Security Signal'],
        [
            ['Error Rate', '2.0', 'Highest security signal'],
            ['Resource Access', '2.0', 'Unauthorized access indicator'],
            ['API Frequency', '1.5', 'Burst activity detection'],
            ['Data Volume', '1.5', 'Exfiltration indicator'],
            ['Action Diversity', '1.2', 'Behavioral drift'],
            ['Response Time', '1.0', 'Processing anomaly'],
        ],
        [50, 25, 105]
    )

    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(*AMBER)
    pdf.cell(0, 6, 'Anomaly: A = Sum(wj * dj) / Sum(wj),  dj = |xj - uj| / (sj + e)', ln=True)
    pdf.set_font('Helvetica', '', 8)
    pdf.set_text_color(*GRAY)
    pdf.cell(0, 5, 'A < 0.3: NORMAL  |  0.3 <= A < 0.6: SUSPICIOUS  |  A >= 0.6: QUARANTINED', ln=True)
    pdf.ln(6)

    pdf.bold_text('Layer 3: Honeypot + Collective Immune Memory')
    pdf.body_text(
        'A Honeypot Agent mimics vulnerability to attract attackers. It captures techniques, '
        'generates defense signatures, and propagates them to ALL agents via Immune Memory. '
        'Result: Attack one agent -> every agent becomes immune.'
    )

    # === PAGE 5: DEMO + METRICS ===
    pdf.add_page()
    pdf.dark_page()
    pdf.set_y(18)

    pdf.section_title('5', 'Demo Features')

    pdf.table(
        ['Feature', 'Description'],
        [
            ['Guided Tour', 'Auto-starts on load, 10-step walkthrough of every section'],
            ['Attack Console', 'Type ANY prompt injection, see real-time detection + risk gauge'],
            ['Security Pipeline', 'Animated L1 -> L2 -> L3 flow visualization'],
            ['Agent Monitor', '6 live agents with status dots + behavioral radar charts'],
            ['Threat Feed', 'Real-time scrolling events via WebSocket'],
            ['Honeypot View', 'Captured attacks, classified techniques, generated signatures'],
            ['Immune Memory', 'Network graph showing defense propagation'],
            ['Detection Analytics', 'Severity breakdown and event type distribution'],
            ['Simulate Attacks', 'One-click injection, spoofing, escalation, exfiltration'],
            ['Expand View', 'Every panel has fullscreen expand for detailed inspection'],
        ],
        [35, 145]
    )

    pdf.section_title('6', 'Key Performance Metrics')

    # Metric boxes
    y = pdf.get_y()
    pdf.set_xy(pdf.l_margin, y)
    pdf.metric_box('Detection Latency', '< 2ms', CYAN)
    pdf.metric_box('Strategies', '5', PURPLE)
    pdf.metric_box('Patterns', '30+', AMBER)
    pdf.metric_box('False Positives', '0%', GREEN)
    pdf.ln(24)
    pdf.set_xy(pdf.l_margin, pdf.get_y())
    pdf.metric_box('Agents', '6', CYAN)
    pdf.metric_box('Dimensions', '6', PURPLE)
    pdf.metric_box('Components', '14', AMBER)
    pdf.metric_box('CSS Lines', '1600+', GREEN)
    pdf.ln(24)
    pdf.set_xy(pdf.l_margin, pdf.get_y())
    pdf.metric_box('Total Code', '6200+', CYAN)
    pdf.metric_box('API Keys', 'Zero', GREEN)
    pdf.metric_box('Real-Time', 'WebSocket', PURPLE)
    pdf.metric_box('Cost', 'Free', GREEN)
    pdf.ln(28)

    # === PAGE 6: CHALLENGES + FUTURE ===
    pdf.add_page()
    pdf.dark_page()
    pdf.set_y(18)

    pdf.section_title('7', 'Challenges & Solutions')
    pdf.table(
        ['Challenge', 'Solution'],
        [
            ['False positives on words like "ignore"', 'Phrase-level matching with context windows'],
            ['Behavioral baseline cold-start', 'Synthetic baselines + exponential moving average'],
            ['Python 3.14 on Render (no wheels)', 'Pinned Python 3.11 via .python-version'],
            ['Premium visuals without chart libs', 'Built all charts with Canvas API directly'],
            ['Real-time without polling', 'WebSocket streaming with auto-reconnect'],
        ],
        [80, 100]
    )

    pdf.section_title('8', 'Future Roadmap')
    pdf.table(
        ['Phase', 'Feature', 'Impact'],
        [
            ['v1.1', 'Azure OpenAI semantic detection', 'Higher accuracy via LLM embeddings'],
            ['v1.2', 'LangChain / AutoGen plugin SDK', 'Real agent integration'],
            ['v2.0', 'Distributed immune network', 'Cross-org signature sharing'],
            ['v2.5', 'Attack signature marketplace', 'Community defense database'],
            ['v3.0', 'OWASP LLM Top 10 dashboard', 'Enterprise audit trails'],
        ],
        [20, 70, 90]
    )

    pdf.ln(10)

    # Closing quote
    pdf.set_fill_color(15, 25, 45)
    pdf.set_draw_color(*CYAN)
    y = pdf.get_y()
    pdf.rect(pdf.l_margin, y, 180, 24, 'DF')
    pdf.set_line_width(1)
    pdf.line(pdf.l_margin, y, pdf.l_margin, y + 24)
    pdf.set_xy(pdf.l_margin + 6, y + 3)
    pdf.set_font('Helvetica', 'BI', 11)
    pdf.set_text_color(*WHITE)
    pdf.cell(168, 8, '"The best security doesn\'t just block attacks --', align='C', ln=True)
    pdf.set_x(pdf.l_margin + 6)
    pdf.cell(168, 8, 'it learns from them and makes everyone stronger."', align='C')
    pdf.ln(12)

    # Team
    pdf.section_title('9', 'Team')
    pdf.set_font('Helvetica', 'B', 11)
    pdf.set_text_color(*WHITE)
    pdf.cell(0, 7, 'Abhijat', ln=True)
    pdf.set_font('Helvetica', '', 9)
    pdf.set_text_color(*GRAY)
    pdf.cell(0, 5, 'Solo Developer -- Architecture, Backend (5 engines), Frontend (14 components),', ln=True)
    pdf.cell(0, 5, 'Design (1,600+ CSS lines), Deployment', ln=True)
    pdf.ln(3)
    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(*CYAN)
    pdf.cell(0, 6, 'Team Srapid  |  AgentArmor  |  Attack one, defend all.', align='C', ln=True)

    # Save
    pdf.output(OUTPUT_PATH)
    print(f'PDF generated: {OUTPUT_PATH}')
    print(f'Pages: {pdf.page_no()}')

if __name__ == '__main__':
    build_pdf()
