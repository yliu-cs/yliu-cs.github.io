## 📜 Publications

<div class="publications">
<ol class="bibliography">

{% for link in site.data.publications.main %}

<li>
<div class="pub-row">
  <div class="col-sm-3 abbr" style="position: relative;padding-right: 15px;padding-left: 15px;">
    {% if link.image %}
    <img src="{{ link.image }}" class="teaser img-fluid z-depth-1" style="width=100;height=40%">
    {% endif %}
    {% if link.conference_short %}
    <abbr class="badge">{{ link.conference_short }}</abbr>
    {% endif %}
  </div>
  <div class="col-sm-9" style="position: relative;padding-right: 15px;padding-left: 20px;">
      <div class="title"><a href="{{ link.url }}">{{ link.title }}</a></div>
      <div class="author">{{ link.authors }}</div>
      <div class="periodical"><em>{{ link.conference }}</em>
      </div>
    <div class="links">
      {% if link.page %}
      <a href="{{ link.page }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">Project Page</a>
      {% endif %}
      {% if link.url %}
      <a href="{{ link.url }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;"><img src="https://img.shields.io/badge/DOI-10.3233%2FFAIA230438-3F72AF?style=flat-square&labelColor=DBE2EF"></a>
      {% endif %}
      {% if link.pdf %}
      <a href="{{ link.pdf }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;"><img src="https://img.shields.io/badge/PDF-D6D6D6?style=flat-square&logo=files"></a>
      {% endif %}
      {% if link.semantic %}
      <a href="https://www.semanticscholar.org/paper/{{ link.semantic }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;"><img src="https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https://api.semanticscholar.org/graph/v1/paper/{{ link.semantic }}?fields=citationCount&style=flat-square&logo=semanticscholar&color=EFD471&labelColor=2B56B0"></a>
      {% endif %}
      {% if link.bibtex %}
      <a href="{{ link.bibtex }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;"><img src="https://img.shields.io/badge/BibTex-fae176.svg?style=flat-square&logo=dblp&labelColor=5A80C4"></a>
      {% endif %}
      {% if link.notes %}
      <img src="https://img.shields.io/badge/{{ link.notes }}?style=flat-square">
      {% endif %}
      {% if link.code %}
      <a href="{{ link.code }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;"><img src="https://img.shields.io/github/stars/yliu-cs/{{ link.code }}?style=flat-square&logo=github&label={{ link.code }}&labelColor=393E46&color=00ADB5"></a>
      {% endif %}
      {% if link.others %}
      {{ link.others }}
      {% endif %}
    </div>
  </div>
</div>
</li>

<br>

{% endfor %}

</ol>
</div>

