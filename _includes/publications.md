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
      {% if link.doi %}
      <div class="title"><a href="https://doi.org/{{ link.doi }}" target="_blank">{{ link.title }}</a></div>
      {% else %}
        {% if link.arxiv %}
          <div class="title"><a href="https://arxiv.org/abs/{{ link.arxiv }}" target="_blank">{{ link.title }}</a></div>
        {% else %}
          <div class="title"><a href="">{{ link.title }}</a></div>
        {% endif %}
      {% endif %}
      <div class="author">{{ link.authors }}</div>
      <div class="periodical"><em>{{ link.conference }}</em>
      </div>
    <div class="links">
      {% if link.page %}
      <a href="{{ link.page }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;"><i class="fas fa-home"></i>&nbsp;Project Page</a>
      {% endif %}
      {% if link.doi %}
      <a href="https://doi.org/{{ link.doi }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;"><i class="ai ai-doi"></i>&nbsp;{{ link.doi }}</a>
      {% else %}
        {% if link.arxiv %}
        <a href="https://arxiv.org/abs/{{ link.arxiv }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;"><i class="ai ai-arxiv"></i>&nbsp;{{ link.arxiv }}</a>
        {% endif %}
      {% endif %}
      {% if link.pdf %}
      <a href="{{ link.pdf }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;"><i class="far fa-file-pdf"></i>&nbsp;PDF</a>
      {% endif %}
      {% if link.bibtex %}
      <a href="{{ link.bibtex }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;"><i class="ai ai-dblp"></i>&nbsp;BibTex</a>
      {% endif %}
      {% if link.dataset %}
      <a href="{{ link.dataset }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;"><i class="fas fa-database"></i>&nbsp;Dataset</a>
      {% endif %}
      {% if link.code %}
      <a href="https://github.com/yliu-cs/{{ link.code }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;"><i class="fab fa-github"></i>&nbsp;{{ link.code }}</a>
      {% endif %}
      {% if link.notes %}
      <strong> <i style="color:#e74d3c">{{ link.notes }}</i></strong>
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

