const slider = document.getElementById("slider");
const track = document.getElementById("track");
const label = document.getElementById("thumb-label");

// Inhalt über dem Slider

function updateLabel() {
    const value = +slider.value;
    label.textContent = value;
  
    const min = +slider.min;
    const max = +slider.max;
    const percent = (value - min) / (max - min);
    const trackWidth = slider.offsetWidth;
    const thumbWidth = 48;
    const offsetLeft = 15; 
  
    const left = percent * (trackWidth - thumbWidth) + offsetLeft;
    label.style.left = `${left}px`;
  }

//Slider ziehen

slider.addEventListener("input", () => {
  updateLabel();
});

slider.addEventListener("mousedown", () => {
  track.style.backgroundColor = "#FF7878";
});
slider.addEventListener("mouseup", () => {
  track.style.backgroundColor = "#FDBABA";
});

updateLabel();

// Genre und Sprache

let selectedGenreId = '';
let selectedGenreName = '';
let selectedLanguage = ''; 

// Dropdown-Menü zur Sprachauswahl

const dropdown = document.getElementById("languageDropdown");
const toggle = dropdown.querySelector(".dropdown-toggle");
const menu = dropdown.querySelector('.dropdown-menu');
const menuItems = dropdown.querySelectorAll('.dropdown-menu div');

// Öffnet oder schliesst das Dropdown-Menü, wenn man Klickt

toggle.addEventListener("click", () => {
  dropdown.classList.toggle("open");
});

// Einzelne Auswahl im Dropdown-Menü

const options = menu.querySelectorAll('div');

options.forEach(option => {
  option.addEventListener('click', () => {

    // Entfernt die vorherige Auswahl
    options.forEach(opt => opt.classList.remove('selected'));

    // Neue Auswahl anwählen 
    option.classList.add('selected');

    // Speichert die Auseahl 
    selectedLanguage = option.getAttribute('data-value');    

    // Optional: Den Text in der Dropdown-Überschrift aktualisieren
    toggle.querySelector('span').textContent = option.textContent;

    // Schliesst das Dropdown Menu
    dropdown.classList.remove('open');
    updateSearchButtonState();
  });  
});

// Genre-Auswahl (Buttons)

const genreButtons = document.querySelectorAll('.genre');

genreButtons.forEach(button => {
  button.addEventListener('click', () => {
    const isSelected = button.classList.contains('selected');

    // Alle Buttons abwählen
    genreButtons.forEach(btn => btn.classList.remove('selected'));

    // Wenn der geklickte Button vorher nicht ausgewählt war, dann auswählen
    if (!isSelected) {
      button.classList.add('selected');
    }
    updateSearchButtonState();  
    // Wenn er vorher schon ausgewählt war, bleibt danach nichts ausgewählt
  }); 
});

function selectGenre(id, name, button) {
  selectedGenreId = id;
  selectedGenreName = name;  
};

// Such-Button (aktivieren/deaktivieren)

function updateSearchButtonState() {
  const button = document.getElementById('search-button');

  const genreSelected = Array.from(document.querySelectorAll('.genre'))
    .some(btn => btn.classList.contains('selected'));

  const languageSelected = !!selectedLanguage;

  // Button nur aktivieren, wenn beide Filter ausgewählt sind
  button.disabled = !(genreSelected && languageSelected);
};

// API-Abfrage: Filme abrufen und anzeigen

async function fetchMovies() {
  document.getElementById('Suche').style.display = 'none';
  document.getElementById('Shuffle').style.display = 'inline-block';     
  document.getElementById("genreText").textContent = `Filme aus der Kategorie ${selectedGenreName}`
  

  const year = document.getElementById('slider').value;
  const lang = selectedLanguage;
  const apiKey = '2a2af8d8d017cd337ffc0c3349e64b29'; 
  const baseUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${selectedGenreId}&primary_release_year=${year}&with_original_language=${lang}&page=1`;

  // Auslesen der maximal verfügbaren Seitenanzahl
  const res = await fetch(baseUrl);
  const data = await res.json();
  const totalPages = data.total_pages;

  // Max. 500 Seiten abrufen
  const randomPage = Math.floor(Math.random() * Math.min(totalPages, 500)) + 1;

  // Zufällige Seite abrufen
  const pageRes = await fetch(baseUrl.replace('page=1', `page=${randomPage}`));
  const pageData = await pageRes.json();

  // Zufällige Auswahl von 3 Filmen
  const results = pageData.results.sort(() => 0.5 - Math.random()).slice(0, 3);

  // Für jeden der ausgewählten Filme weitere Details laden z.B. Beschreibung etc.
  const movieDetails = await Promise.all(results.map(async movie => {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&language=${lang}`);
    return await res.json();
  }));

// Filme anzeigen
  displayMovies(movieDetails);
}

// Zeigt die die Filme im HTML Container an

function displayMovies(movies) {
  const container = document.getElementById('movie-container');
  container.innerHTML = '';

  movies.forEach(movie => {
    // Poster-URL
    const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : 'images/no_image.svg';

    // Neues Div-Element für den Film erstellen
    const div = document.createElement('div');
    div.className = 'movie';

    // Bei Klick Filmkarte umdrehen
    div.onclick = () => div.classList.toggle('flipped');

    // Inneres HTML mit Vorder- und Rückseite
    div.innerHTML = `
      <div class="movie-inner">
        <div class="movie-front">
          <img src="${posterPath}" alt="${movie.title}" />
          <div class="movie-title">${movie.title}</div>
          <div class="rating">⭐ ${movie.vote_average.toFixed(1)}</div>
          <div class="desc">Mehr Infos</div>
        </div>
        <div class="movie-back">
          <h3>${movie.title}</h3>
          <p>${movie.overview || 'Keine Beschreibung verfügbar.'}</p>
        </div>
      </div>
    `;
    
    container.appendChild(div);
  });
}