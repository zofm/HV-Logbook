const imagesDices = [
  "assets/die_yellow.svg",
  "assets/die_blue.svg",
  "assets/die_green.svg",
  "assets/die_black.svg",
];

const imagesClasses = [
  "assets/class_attacker.svg?v=1747137495847",
  "assets/class_defender.svg?v=1747137494530",
  "assets/class_archer.svg?v=1747137497180",
  "assets/class_tactician.svg?v=1747137492925",
];

const imageBane =
  "assets/scion.svg";
const imageActiveBane =
  "assets/scion_active.svg";

const storeKey = "victorum_mercury_logbook";

const setupDiceModifiers = () => {
  const container = document.getElementById("diceModifiers");
  for (let col = 0; col < 4; col++) {
    const colDiv = document.createElement("div");
    colDiv.classList.add("dice-column");
    for (let i = 0; i < 4; i++) {
      const die = document.createElement("div");
      die.classList.add("dice");
      die.setAttribute("data-index", i);

      const img = document.createElement("img");
      img.src = `${imagesDices[i]}`;
      img.alt = imagesDices[i];
      die.appendChild(img);

      die.addEventListener("click", () => {
        const diceInCol = Array.from(colDiv.querySelectorAll(".dice"));
        const isActive = die.classList.contains("active");

        if (isActive) {
          if (i === 0) {
            // Se è il giallo (indice 0, il più basso), resetta tutta la colonna
            diceInCol.forEach((d) => d.classList.remove("active"));
          } else {
            // Se è un altro dado: deseleziona solo lui e quelli sopra
            diceInCol.forEach((d, idx) => {
              if (idx >= i) d.classList.remove("active");
            });
          }
        } else {
          // Attiva lui e tutti quelli sotto
          diceInCol.forEach((d, idx) => {
            if (idx <= i) d.classList.add("active");
          });
        }
      });

      colDiv.appendChild(die);
    }
    container.appendChild(colDiv);
  }
};

const setupTracks = () => {
  createTrack("opportunity", 5, true, true);
  createTrack("health", 12, true, true);
  createTrack("leadership", 12, true, true);
  createTrack("blessings", 10, true, true, true);
  createTrack("navigation", 4, true, true);
  createSymbolTrack("class", imagesClasses, true);

  // Journey - 4 atti da 6
  document.querySelectorAll("#journey .track").forEach((track) => {
    createTrack(track, 6, true, true, true);
  });

  // Scion Influence - 44 pallini con icona ogni 4
  const scion = document.getElementById("scion");

  for (let i = 0; i < 44; i++) {
    const dot = document.createElement("div");

    let img;
    const isMultipleOf4 = (i + 1) % 4 === 0;

    if (isMultipleOf4) {
      img = document.createElement("img");
      img.src = imageBane;
      img.alt = "Add a bane";
      dot.appendChild(img);
    }

    dot.addEventListener("click", () => {
      const dots = Array.from(scion.querySelectorAll("div"));
      const isActive = dot.classList.contains("active");

      const firstActiveIndex = dots.findIndex((d) =>
        d.classList.contains("active")
      );

      // Se clicco il primo già attivo → resetta tutto
      if (isActive && i === firstActiveIndex) {
        dots.forEach((d, idx) => {
          d.classList.remove("active");
          // Reset icona multipli di 4
          if ((idx + 1) % 4 === 0) {
            const img = d.querySelector("img");
            if (img) {
              img.src = imageBane;
            }
          }
        });
      } else {
        dots.forEach((d, index) => {
          const isNowActive = index <= i;
          d.classList.toggle("active", isNowActive);
          if ((index + 1) % 4 === 0) {
            const img = d.querySelector("img");
            if (img) {
              img.src = isNowActive ? imageActiveBane : imageBane;
            }
          }
        });
      }
    });

    scion.appendChild(dot);
  }
};

const createTrack = (
  idOrElem,
  count,
  progressive = false,
  showNumbers = false,
  resettable = false
) => {
  const container =
    typeof idOrElem === "string" ? document.getElementById(idOrElem) : idOrElem;
  for (let i = 0; i < count; i++) {
    const dot = document.createElement("div");

    if (showNumbers) {
      dot.textContent = i + 1; // I numeri partono da 1
    }

    if (progressive) {
      dot.addEventListener("click", () => {
        const dots = container.querySelectorAll("div");
        const isActive = dot.classList.contains("active");

        // Se resettable e clicco il primo pallino già attivo → resetta tutto
        if (resettable && i === 0 && isActive) {
          dots.forEach((d) => d.classList.remove("active"));
          return;
        }

        dots.forEach((d, index) => {
          d.classList.toggle("active", index <= i);
        });
      });
    } else {
      dot.addEventListener("click", () => dot.classList.toggle("active"));
    }
    container.appendChild(dot);
  }
};

const createSymbolTrack = (id, symbols, singleSelect = false) => {
  const container = document.getElementById(id);
  symbols.forEach((symbol) => {
    const dot = document.createElement("div");
    //dot.setAttribute("data-symbol", symbol);

    const img = document.createElement("img");
    img.src = `${symbol}`;
    img.alt = "";
    dot.appendChild(img);

    dot.addEventListener("click", () => {
      if (singleSelect) {
        container
          .querySelectorAll("div")
          .forEach((d) => d.classList.remove("active"));
      }
      dot.classList.toggle("active");
    });
    container.appendChild(dot);
  });
};

const save = (showAlert = true) => {
  const data = {
    heroName: document.getElementById("heroName").value,
    movement: document.getElementById("movement").value,
    range: document.getElementById("range").value,
    tracks: {},
    diceModifiers: [],
  };

  document.querySelectorAll(".track").forEach((track) => {
    const id = track.id || track.dataset.act;
    if (!id) return;
    const values = [];
    track.querySelectorAll("div").forEach((dot) => {
      values.push(dot.classList.contains("active"));
    });
    data.tracks[id] = values;
  });

  // Salva i modificatori dado
  document.querySelectorAll(".dice-column").forEach((col) => {
    const colValues = [];
    col.querySelectorAll(".dice").forEach((die) => {
      colValues.push(die.classList.contains("active"));
    });
    data.diceModifiers.push(colValues);
  });

  localStorage.setItem(storeKey, JSON.stringify(data));
  if (showAlert) alert("Your game session has been saved!");
};

const load = (showConfirm = false) => {
  if (
    showConfirm &&
    !confirm(
      "Are you sure you want to load the last save? Any unsaved changes will be lost."
    )
  )
    return;

  const data = JSON.parse(localStorage.getItem(storeKey));
  if (!data) return;
  document.getElementById("heroName").value = data.heroName || "";
  document.getElementById("movement").value = data.movement || "";
  document.getElementById("range").value = data.range || "";

  Object.keys(data.tracks).forEach((id) => {
    const track =
      document.getElementById(id) ||
      document.querySelector(`.track[data-act="${id}"]`);
    if (!track) return;
    const divs = track.querySelectorAll("div");
    data.tracks[id].forEach((active, i) => {
      const div = divs[i];
      if (!div) return;

      div.classList.toggle("active", active);

      // Se siamo nello Scion track e multiplo di 4 → aggiorna immagine
      if (id === "scion" && (i + 1) % 4 === 0) {
        const img = div.querySelector("img");
        if (img) {
          img.src = active ? imageActiveBane : imageBane;
        }
      }
    });
  });

  // Carica modificatori dado
  if (data.diceModifiers) {
    const allCols = document.querySelectorAll(".dice-column");
    data.diceModifiers.forEach((col, i) => {
      if (!allCols[i]) return;
      col.forEach((active, j) => {
        const die = allCols[i].children[j];
        if (die) die.classList.toggle("active", active);
      });
    });
  }

  // Stato checkbox autosalvataggio
  const autoSaveStored = localStorage.getItem("autoSaveEnabled");
  if (autoSaveStored !== null) {
    document.getElementById("autoSave").checked = autoSaveStored === "true";
  }
};

const reset = () => {
  if (
    !confirm(
      "Are you sure you want to delete this game session? All your saved data will be lost."
    )
  )
    return;
  localStorage.removeItem(storeKey);
  document.getElementById("heroName").value = "";
  document.getElementById("movement").value = "";
  document.getElementById("range").value = "";
  document
    .querySelectorAll(".track div")
    .forEach((div) => div.classList.remove("active"));
  document
    .querySelectorAll(".dice")
    .forEach((div) => div.classList.remove("active"));
  localStorage.removeItem("autoSaveEnabled");
  document.getElementById("autoSave").checked = false;
};

const autoSaveIfEnabled = () => {
  const autoSaveEnabled = document.getElementById("autoSave").checked;
  if (autoSaveEnabled) {
    save(false); // Salvataggio silenzioso, senza alert
  }
};

setupTracks();
setupDiceModifiers();
load();

// Abilita salvataggio automatico su clic
document.querySelectorAll(".track div, .dice").forEach((el) => {
  el.addEventListener("click", autoSaveIfEnabled);
});

document.querySelectorAll("input, textarea").forEach((el) => {
  el.addEventListener("input", autoSaveIfEnabled);
});

// Stato della checkbox di autosalvataggio
document.getElementById("autoSave").addEventListener("change", (e) => {
  localStorage.setItem("autoSaveEnabled", e.target.checked);
  const reloadBtn = document.getElementById("reloadButton");
  reloadBtn.disabled = e.target.checked;
});

// Disabilita il bottone Reload se autosave è attivo
const auto = document.getElementById("autoSave");
const reloadBtn = document.getElementById("reloadButton");
if (reloadBtn && auto) {
  reloadBtn.disabled = auto.checked;
}
