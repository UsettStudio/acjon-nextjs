/**
 * Selvstendige stiler for de tekstbaserte sidene (/priser, /tjenester).
 *
 * Ligger som en <style>-blokk framfor i globals.scss, slik at malens
 * eksisterende regler ikke kan overstyre dem – og slik at disse sidene kan
 * flyttes eller fjernes uten å rydde i den globale stilfila. Alt er scopet
 * under .usett-doc.
 *
 * Fargene følger de mørke seksjonene på forsiden (#010103) og aksentfargen
 * som allerede brukes ellers på nettstedet.
 */
const ContentStyles = () => (
    <style
        dangerouslySetInnerHTML={{
            __html: `
.usett-doc{
  --doc-bg:#010103;
  --doc-fg:#F5F7F5;
  --doc-muted:#A6ADB2;
  --doc-line:#22262B;
  --doc-panel:#0C0F13;
  --doc-accent:#F9A01B;
  background:var(--doc-bg);
  color:var(--doc-fg);
  padding:160px 0 120px;
}
.usett-doc a{color:var(--doc-accent);text-decoration:none}
.usett-doc a:hover{text-decoration:underline}
.usett-doc .doc-wrap{max-width:900px;margin:0 auto;padding:0 24px}
.usett-doc .doc-wide{max-width:1180px;margin:0 auto;padding:0 24px}

.usett-doc .doc-crumbs{font-size:14px;color:var(--doc-muted);margin-bottom:28px}
.usett-doc .doc-crumbs a{color:var(--doc-muted)}
.usett-doc .doc-crumbs span{margin:0 8px;opacity:.5}

.usett-doc h1{
  font-size:clamp(30px,4.6vw,52px);line-height:1.06;letter-spacing:-.02em;
  margin:0 0 22px;font-weight:700;text-wrap:balance;
}
.usett-doc h2{
  font-size:clamp(22px,2.8vw,30px);line-height:1.18;letter-spacing:-.01em;
  margin:56px 0 14px;font-weight:600;text-wrap:balance;
}
.usett-doc h3{font-size:19px;margin:32px 0 8px;font-weight:600}
.usett-doc p{font-size:17px;line-height:1.65;color:var(--doc-fg);margin:0 0 16px;max-width:68ch}
.usett-doc .doc-answer{
  font-size:20px;line-height:1.55;color:var(--doc-fg);
  border-left:3px solid var(--doc-accent);padding:4px 0 4px 22px;margin:0 0 34px;max-width:64ch;
}
.usett-doc ul{margin:0 0 20px;padding-left:20px;max-width:68ch}
.usett-doc li{margin-bottom:9px;font-size:17px;line-height:1.6;color:var(--doc-fg)}
.usett-doc li::marker{color:var(--doc-accent)}

.usett-doc .doc-meta{
  display:flex;flex-wrap:wrap;gap:0;border-top:1px solid var(--doc-line);
  border-bottom:1px solid var(--doc-line);padding:18px 0;margin:0 0 44px;
}
.usett-doc .doc-meta div{padding-right:34px;margin-right:34px;border-right:1px solid var(--doc-line)}
.usett-doc .doc-meta div:last-child{border-right:0;margin-right:0;padding-right:0}
.usett-doc .doc-meta dt{font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--doc-muted);margin:0 0 5px}
.usett-doc .doc-meta dd{margin:0;font-size:17px;font-weight:600}

.usett-doc .doc-cards{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px;margin:26px 0 10px;
}
.usett-doc .doc-card{
  background:var(--doc-panel);border:1px solid var(--doc-line);border-radius:4px;
  padding:26px 24px;display:flex;flex-direction:column;
}
.usett-doc .doc-card.is-popular{border-color:var(--doc-accent)}
.usett-doc .doc-card .tag{
  font-size:11px;letter-spacing:.11em;text-transform:uppercase;color:#010103;
  background:var(--doc-accent);padding:3px 8px;border-radius:2px;align-self:flex-start;margin-bottom:14px;font-weight:600;
}
.usett-doc .doc-card h3{margin:0 0 6px;font-size:21px}
.usett-doc .doc-card .price{font-size:30px;font-weight:700;margin:10px 0 2px;letter-spacing:-.02em}
.usett-doc .doc-card .period{font-size:14px;color:var(--doc-muted);margin-bottom:16px}
.usett-doc .doc-card p{font-size:15px;color:var(--doc-muted);margin-bottom:16px}
.usett-doc .doc-card ul{margin:0;padding-left:18px}
.usett-doc .doc-card li{font-size:15px;margin-bottom:7px}

.usett-doc .doc-links{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin:26px 0;
}
.usett-doc .doc-link{
  display:block;background:var(--doc-panel);border:1px solid var(--doc-line);border-radius:4px;
  padding:22px 22px;color:var(--doc-fg);text-decoration:none;transition:border-color .18s ease;
}
.usett-doc .doc-link:hover,.usett-doc .doc-link:focus-visible{border-color:var(--doc-accent);text-decoration:none}
.usett-doc .doc-link strong{display:block;font-size:18px;margin-bottom:7px}
.usett-doc .doc-link span{display:block;font-size:15px;color:var(--doc-muted);line-height:1.5}
.usett-doc .doc-link em{display:block;font-style:normal;font-size:13px;color:var(--doc-accent);margin-top:12px}

.usett-doc .doc-faq{border-top:1px solid var(--doc-line);margin-top:14px}
.usett-doc .doc-faq details{border-bottom:1px solid var(--doc-line);padding:18px 0}
.usett-doc .doc-faq summary{
  font-size:18px;font-weight:600;cursor:pointer;list-style:none;
  display:flex;justify-content:space-between;gap:20px;align-items:baseline;
}
.usett-doc .doc-faq summary::-webkit-details-marker{display:none}
.usett-doc .doc-faq summary::after{content:"+";color:var(--doc-accent);font-weight:400;font-size:22px;line-height:1}
.usett-doc .doc-faq details[open] summary::after{content:"–"}
.usett-doc .doc-faq p{margin:14px 0 0;color:var(--doc-muted)}

.usett-doc .doc-cta{
  border:1px solid var(--doc-line);border-radius:4px;background:var(--doc-panel);
  padding:34px 30px;margin-top:60px;
}
.usett-doc .doc-cta h2{margin:0 0 10px;font-size:24px}
.usett-doc .doc-cta p{color:var(--doc-muted);margin-bottom:20px}
.usett-doc .doc-cta a.btn{
  display:inline-block;background:var(--doc-accent);color:#010103;font-weight:600;
  padding:13px 26px;border-radius:3px;text-decoration:none;margin-right:10px;
}
.usett-doc .doc-cta a.btn:hover{text-decoration:none;opacity:.9}
.usett-doc .doc-updated{font-size:13px;color:var(--doc-muted);margin-top:44px}

@media (max-width:640px){
  .usett-doc{padding:120px 0 90px}
  .usett-doc .doc-meta div{border-right:0;margin-right:0;padding-right:0;width:100%;margin-bottom:14px}
}
`,
        }}
    />
);

export default ContentStyles;
