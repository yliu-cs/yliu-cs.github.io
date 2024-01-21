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
      <div class="title"><a href="https://doi.org/{{ link.doi }}">{{ link.title }}</a></div>
      <div class="author">{{ link.authors }}</div>
      <div class="periodical"><em>{{ link.conference }}</em>
      </div>
    <div class="links">
      {% if link.page %}
      [Project Page]({{ link.page }})
      {% endif %}
      {% if link.doi %}
      [![DOI](https://img.shields.io/badge/{{ link.doi }}-3F72AF?style=flat-square&labelColor=000000&logo=doi&logoColor=F0B941)](https://doi.org/{{ link.doi }})
      {% endif %}
      {% if link.pdf %}
      [![PDF](https://img.shields.io/badge/PDF-D6D6D6?style=flat-square&logo=files)]({{ link.pdf }})
      {% endif %}
      {% if link.semantic %}
      [![Semantic Scholar](https://img.shields.io/badge/dynamic/json?label=citation&query=citationCount&url=https://api.semanticscholar.org/graph/v1/paper/{{ link.semantic }}?fields=citationCount&style=flat-square&logo=semanticscholar&color=EFD471&labelColor=2B56B0)](https://www.semanticscholar.org/paper/{{ link.semantic }})
      {% endif %}
      {% if link.bibtex %}
      [![BibTex](https://img.shields.io/badge/BibTex-fae176.svg?style=flat-square&logo=dblp&labelColor=5A80C4)]({{ link.bibtex }})
      {% endif %}
      {% if link.code %}
      <a href="" class="btn-badge" target="_blank" style="font-size:12px;"><img src=""></a>
      [![{{ link.code }}](https://img.shields.io/github/stars/{{ link.code }}?style=flat-square&logo=github&label={{ link.code }}&labelColor=393E46&color=00ADB5)](https://github.com/{{ link.code }})
      {% endif %}
      {% if link.notes %}
      ![Notes](https://img.shields.io/badge/{{ link.notes }}?style=flat-square)
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

