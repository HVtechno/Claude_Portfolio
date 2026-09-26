// -----------------------------------------------------------------------------
// cv.ts — the ORIGINAL CV, used to seed the /cv page before anything has been
// published from the private editor (/cv/edit). After the first Publish, the
// live CV comes from storage (Supabase, or .data/cv.json locally) — edit it in
// the browser, not here. "Original from resume" in History restores this.
// -----------------------------------------------------------------------------

import type { CvData } from "@/lib/cv/types";

export const CV_SEED: CvData = {
  name: "Harihara Subramanian Ganesh",
  title: "Senior Data Engineer · Solution & Data Architect · Team Lead",
  contact: [
    "hganesh0786@gmail.com",
    "+31 6 39262121",
    "Alphen aan den Rijn, Netherlands",
    "linkedin.com/in/harihara-subramanian-ganesh-57ba71166",
    "github.com/HVtechno",
  ],
  summary:
    "Data and software engineer with 10+ years across data engineering, full-stack development, DevOps, BI and automation, now moving into Solution / Data Architect and Data Team Lead roles. Designs and ships end-to-end Azure data platforms and the products on top of them, leads and mentors engineers, and works directly with product owners to turn requirements into architecture and delivery. Microsoft Azure certified; strong in Azure DevOps and Agile.",
  jobs: [
    {
      when: "Oct 2025 – Present",
      role: "Senior Data Engineer",
      org: "ING Netherlands",
      bullets: [
        "Engineered Python-based ETL pipelines using XFBs, SFTP, Kafka and SQL for robust data processing.",
        "Automated data-analytics workflows, significantly reducing manual tasks and improving operational efficiency.",
        "Oversaw ETL deployment and maintenance on Azure within the Security & DevOps team.",
        "Built SharePoint-based workflow automation in compliance with security protocols.",
        "Created monitoring dashboards with Python, React.js and Power BI for ETL and data-quality oversight.",
      ],
    },
    {
      when: "Jan 2025 – Sep 2025",
      role: "Senior Python Data Engineer",
      org: "Ebicus B.V.",
      bullets: [
        "Crafted end-to-end data solutions on Azure with seamless integration and optimized workflows.",
        "Built reusable Python ETL scripts, boosting data-processing speed by 30% and cutting manual effort by 50%.",
        "Implemented Azure Functions to streamline ETL, reducing processing costs by 25% and increasing throughput by 40%.",
        "Engineered a web-based ETL monitoring tool, improving data-quality enforcement with 40% faster performance reports.",
      ],
    },
    {
      when: "Jul 2024 – Dec 2024",
      role: "Senior Azure Data Engineer",
      org: "Dynamic People B.V.",
      bullets: [
        "Optimized ingestion and transformation with Azure Synapse, Databricks and PySpark; integrated 10+ sources and improved Power BI refresh efficiency by 30%.",
        "Led a team of two junior engineers building and maintaining CI/CD pipelines in Azure DevOps for Synapse and Databricks.",
        "Enhanced pipeline reliability for financial reporting, reducing manual effort by 60% and improving efficiency by up to 40%.",
      ],
    },
    {
      when: "Jul 2022 – Dec 2023",
      role: "Senior Azure Data Engineer",
      org: "Anheuser-Busch InBev",
      bullets: [
        "Directed full-stack development with React, Node.js, Flask and SQL.",
        "Built and maintained Progressive Web Apps (PWAs) and REST APIs.",
        "Managed Azure DevOps CI/CD pipelines and automated deployments.",
        "Developed Python ETL pipelines using Azure Functions, Databricks and Azure SQL.",
        "Designed SQL stored procedures, views and data-processing workflows.",
      ],
    },
    {
      when: "Aug 2019 – Jul 2022",
      role: "Senior BI Developer",
      org: "Anheuser-Busch InBev",
      bullets: [
        "Translated business requirements into data-driven solutions.",
        "Built ETL pipelines with Python, VBScript, SAP GUI, Oracle, SharePoint, Databricks and Azure SQL.",
        "Built predictive models with Python, Pandas and NumPy.",
        "Designed interactive Power BI dashboards and reports; automated integration and reporting across sources.",
      ],
    },
    {
      when: "May 2017 – Jun 2019",
      role: "Process Specialist",
      org: "Infosys BPO s.r.o.",
      bullets: [
        "Led development of business documents with robust validation, improving data integrity by 30%.",
        "Streamlined client trade-message resolution in CSV and FpML, boosting processing efficiency by 30%.",
        "Increased client satisfaction by 20% through collaboration with development teams.",
      ],
    },
    {
      when: "Sep 2015 – Jan 2017",
      role: "Software Engineer",
      org: "ATOS",
      bullets: [
        "Automated reconciliation using Excel macros and MS Access, increasing efficiency by 35%.",
        "Designed a web app in Python and JavaScript, improving trade-message processing efficiency by 30%.",
        "Led a small team enhancing automation with Python, VBScript and JavaScript, achieving a 33% efficiency gain.",
      ],
    },
  ],
  skills: [
    { label: "Languages", items: ["Python", "PySpark", "SQL", "JavaScript", "C#", "VBScript"] },
    {
      label: "Data & cloud",
      items: ["Azure Synapse", "Databricks", "Azure Data Factory", "Azure Functions", "Azure Data Lake", "Microsoft Fabric", "Kafka", "AWS", "Google Cloud"],
    },
    { label: "Full-stack & AI", items: ["React", "Next.js", "FastAPI", "Flask", "Node.js", "OpenAI", "RAG", "Agentic workflows"] },
    { label: "Data stores & BI", items: ["Azure SQL", "PostgreSQL", "MongoDB", "Oracle", "Power BI", "Streamlit"] },
    { label: "Delivery", items: ["Azure DevOps CI/CD", "Docker", "Agile / Scrum", "Team Leadership", "Mentoring"] },
  ],
  certs: [
    { name: "Azure Solutions Architect Expert", meta: "Microsoft · Aug 2025" },
    { name: "Azure Administrator Associate", meta: "Microsoft · Aug 2025" },
    { name: "Azure Security Engineer Associate", meta: "Microsoft · Aug 2024" },
    { name: "Azure Data Engineer Associate (DP-203)", meta: "Microsoft · Jul 2023" },
    { name: "Azure Developer Associate", meta: "Microsoft · Feb 2023" },
    { name: "Azure Data Fundamentals", meta: "Microsoft · Jun 2022" },
  ],
  education: [
    { name: "Master of Science", meta: "VSB Technical University · 2017 – 2020" },
    { name: "Bachelor of Technology", meta: "Crescent Engineering College · 2011 – 2015" },
  ],
};
