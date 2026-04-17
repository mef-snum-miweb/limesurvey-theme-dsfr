/* Thème DSFR pour LimeSurvey — bundle généré par esbuild depuis src/. Ne pas éditer à la main. */
(() => {
  // modules/theme-dsfr/src/core/i18n.js
  var MANDATORY_I18N_FR = {
    fields_remaining_plural: "Veuillez compléter les %remaining% champs restants sur %total%.",
    fields_remaining_singular: "Veuillez compléter le dernier champ.",
    fields_all_required: "Veuillez compléter tous les champs (%total% champs requis).",
    field_valid: "Saisie valide",
    numeric_only: "Ce champ n'accepte que des valeurs numériques."
  };
  var MANDATORY_I18N_EN = {
    fields_remaining_plural: "Please complete the remaining %remaining% of %total% fields.",
    fields_remaining_singular: "Please complete the last field.",
    fields_all_required: "Please complete all fields (%total% fields required).",
    field_valid: "Valid input",
    numeric_only: "This field only accepts numeric values."
  };
  function tMandatory(key, remaining, total) {
    const lang = (document.documentElement.lang || "fr").toLowerCase().substring(0, 2);
    const dict = lang === "en" ? MANDATORY_I18N_EN : MANDATORY_I18N_FR;
    let str = dict[key] || MANDATORY_I18N_FR[key] || key;
    if (typeof remaining !== "undefined") {
      str = str.replace("%remaining%", remaining);
    }
    if (typeof total !== "undefined") {
      str = str.replace("%total%", total);
    }
    return str;
  }
  var RANKING_I18N_FR = {
    ranking_actions_for: "Actions pour %s",
    ranking_add: "Ajouter au classement",
    ranking_add_aria: "Ajouter %s au classement",
    ranking_up: "Monter",
    ranking_up_aria: "Monter %s",
    ranking_down: "Descendre",
    ranking_down_aria: "Descendre %s",
    ranking_remove: "Retirer",
    ranking_remove_aria: "Retirer %s du classement"
  };
  var RANKING_I18N_EN = {
    ranking_actions_for: "Actions for %s",
    ranking_add: "Add to ranking",
    ranking_add_aria: "Add %s to ranking",
    ranking_up: "Move up",
    ranking_up_aria: "Move %s up",
    ranking_down: "Move down",
    ranking_down_aria: "Move %s down",
    ranking_remove: "Remove",
    ranking_remove_aria: "Remove %s from ranking"
  };
  function tRanking(key, label) {
    const lang = (document.documentElement.lang || "fr").toLowerCase().substring(0, 2);
    const dict = lang === "en" ? RANKING_I18N_EN : RANKING_I18N_FR;
    let str = dict[key] || RANKING_I18N_FR[key] || key;
    if (typeof label !== "undefined") {
      str = str.replace("%s", label);
    }
    return str;
  }

  // modules/theme-dsfr/src/core/dom-utils.js
  function isValidNumber(value) {
    return /^-?\d+([.,]\d*)?$/.test(value) || /^-?\d*[.,]\d+$/.test(value);
  }
  function isQuestionHidden(el) {
    return el.style.display === "none" || el.classList.contains("ls-irrelevant") || el.classList.contains("ls-hidden") || el.classList.contains("d-none");
  }

  // modules/theme-dsfr/src/validation/error-summary.js
  function createErrorSummary() {
    const oldSummary = document.getElementById("dsfr-error-summary");
    if (oldSummary) {
      oldSummary.remove();
    }
    const errorQuestions = document.querySelectorAll(".question-container.input-error, .question-container.fr-input-group--error");
    if (errorQuestions.length === 0) {
      return;
    }
    const errorList = [];
    errorQuestions.forEach(function(question) {
      const questionId = question.id;
      const questionTextElement = question.querySelector(".ls-label-question, .question-text");
      let questionText = questionTextElement ? questionTextElement.textContent.trim() : "Question sans titre";
      const questionNumberElement = question.querySelector(".question-number");
      let questionNumber = questionNumberElement ? questionNumberElement.textContent.trim() : "";
      const errorMessageElement = question.querySelector(".fr-message--error");
      let errorMessage = errorMessageElement ? errorMessageElement.textContent.trim() : "";
      let label = questionText;
      if (errorMessage) {
        label += " : " + errorMessage;
      }
      if (label.length > 150) {
        label = label.substring(0, 147) + "...";
      }
      errorList.push({
        id: questionId,
        label
      });
    });
    const summary = document.createElement("div");
    summary.id = "dsfr-error-summary";
    summary.className = "fr-alert fr-alert--error fr-mb-4w";
    summary.setAttribute("role", "alert");
    summary.setAttribute("tabindex", "-1");
    let html = '<h3 class="fr-alert__title">';
    html += errorList.length === 1 ? "Une erreur a été détectée" : errorList.length + " erreurs ont été détectées";
    html += "</h3>";
    html += "<p>Veuillez corriger les erreurs suivantes :</p>";
    html += '<ul class="fr-mb-0">';
    errorList.forEach(function(error) {
      html += '<li class="error-item" data-question-id="' + error.id + '">';
      html += '<a href="#' + error.id + '" class="fr-link fr-icon-error-warning-line fr-link--icon-left">' + error.label + "</a>";
      html += "</li>";
    });
    html += "</ul>";
    summary.innerHTML = html;
    summary.querySelectorAll('a[href^="#"]').forEach(function(link) {
      link.addEventListener("click", function(e) {
        e.preventDefault();
        const targetId = this.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(function() {
            const firstInput = targetElement.querySelector(".fr-input, input, textarea, select");
            if (firstInput) {
              firstInput.focus();
            }
          }, 300);
        }
      });
    });
    const questionContainer = document.querySelector(".questions-container, .survey-question-container, #question-container, .question-container");
    const firstQuestion = document.querySelector(".question-container");
    if (questionContainer && questionContainer.parentNode) {
      questionContainer.parentNode.insertBefore(summary, questionContainer);
    } else if (firstQuestion && firstQuestion.parentNode) {
      firstQuestion.parentNode.insertBefore(summary, firstQuestion);
    } else {
      const form = document.querySelector('form#limesurvey, form[name="limesurvey"]');
      if (form) {
        form.insertBefore(summary, form.firstChild);
      }
    }
    setTimeout(function() {
      summary.scrollIntoView({ behavior: "smooth", block: "start" });
      summary.focus();
    }, 100);
  }
  function updateErrorSummary() {
    const summary = document.getElementById("dsfr-error-summary");
    if (!summary) {
      return;
    }
    const errorItems = summary.querySelectorAll(".error-item");
    let totalErrors = errorItems.length;
    let correctedCount = 0;
    errorItems.forEach(function(item) {
      const questionId = item.getAttribute("data-question-id");
      const question = document.getElementById(questionId);
      if (!question) return;
      const isError = question.classList.contains("input-error");
      const isValid = question.classList.contains("input-valid");
      const inputs = question.querySelectorAll('.fr-input, input[type="text"], input[type="number"], textarea, select');
      let allInputsValid = inputs.length > 0;
      inputs.forEach(function(input) {
        if (input.classList.contains("fr-input--error") || !input.value || input.value.trim() === "") {
          allInputsValid = false;
        }
      });
      if (isValid && !isError || allInputsValid) {
        if (!item.classList.contains("corrected")) {
          item.classList.add("corrected");
          const link = item.querySelector("a");
          if (link) {
            link.classList.remove("fr-icon-error-warning-line");
            link.classList.add("fr-icon-checkbox-circle-line");
          }
        }
        correctedCount++;
      }
    });
    const title = summary.querySelector(".fr-alert__title");
    const description = summary.querySelector("p");
    if (correctedCount === totalErrors) {
      summary.className = "fr-alert fr-alert--success fr-mb-4w";
      if (title) {
        title.textContent = "Toutes les erreurs ont été corrigées !";
      }
      if (description) {
        description.textContent = "Vous pouvez maintenant soumettre le formulaire.";
      }
    } else if (correctedCount > 0) {
      summary.className = "fr-alert fr-alert--warning fr-mb-4w";
      if (title) {
        const remaining = totalErrors - correctedCount;
        title.textContent = remaining + " erreur" + (remaining > 1 ? "s" : "") + " restante" + (remaining > 1 ? "s" : "");
      }
      if (description) {
        description.textContent = "Continuez à corriger les erreurs suivantes :";
      }
    }
  }
  function initErrorSummaryObserver() {
    if (!document.body) return;
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          const target = mutation.target;
          if (target.classList && target.classList.contains("question-container") && target.classList.contains("input-error")) {
            setTimeout(createErrorSummary, 100);
          }
        }
      });
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
      subtree: true
    });
  }

  // modules/theme-dsfr/src/legacy.js
  console.log(
    "%c\n             Développé avec ❤️ par la                   \n                                                        \n       ███╗   ███╗██╗██╗    ██╗███████╗██████╗           \n       ████╗ ████║██║██║    ██║██╔════╝██╔══██╗          \n       ██╔████╔██║██║██║ █╗ ██║█████╗  ██████╔╝          \n       ██║╚██╔╝██║██║██║███╗██║██╔══╝  ██╔══██╗          \n       ██║ ╚═╝ ██║██║╚███╔███╔╝███████╗██████╔╝          \n       ╚═╝     ╚═╝╚═╝ ╚══╝╚══╝ ╚══════╝╚═════╝           \n                                                        \n           Mission Ingénierie du Web                   \n    Ministère de l'Économie et des Finances         \n    https://github.com/bmatge/limesurvey-theme-dsfr  \n    Thème DSFR pour LimeSurvey - 2025 - Etalab 2.0    \n",
    "color: #000091; font-weight: bold;"
  );
  (function() {
    "use strict";
    function getItemLabel(item) {
      var textSpan = item.querySelector(".ranking-item-text");
      if (textSpan) return textSpan.textContent.trim();
      return item.dataset.label || item.textContent.trim();
    }
    function announce(qId, message) {
      var liveRegion = document.getElementById("ranking-live-" + qId);
      if (!liveRegion) return;
      liveRegion.textContent = "";
      setTimeout(function() {
        liveRegion.textContent = message;
      }, 50);
    }
    function syncHiddenSelects(qId) {
      var questionEl = document.getElementById("question" + qId);
      if (!questionEl) return;
      var rankedItems = document.querySelectorAll("#sortable-rank-" + qId + " li:not(.ls-remove):not(.d-none)");
      var selects = questionEl.querySelectorAll(".select-list .select-item select");
      selects.forEach(function(select) {
        select.value = "";
      });
      rankedItems.forEach(function(item, index) {
        if (index < selects.length) {
          var oldVal = selects[index].value;
          selects[index].value = item.dataset.value;
          if (oldVal !== item.dataset.value) {
            if (typeof $ !== "undefined") {
              $(selects[index]).trigger("change", { source: "dragdrop" });
            }
          }
        }
      });
      var rankingName = questionEl.querySelector(".ranking-question-dsfr") ? questionEl.querySelector(".ranking-question-dsfr").dataset.rankingName : null;
      if (!rankingName) {
        var container = questionEl.querySelector("[data-ranking-name]");
        if (container) rankingName = container.dataset.rankingName;
      }
      if (rankingName) {
        var relevanceInputs = document.querySelectorAll('[id^="relevance' + rankingName + '"]');
        relevanceInputs.forEach(function(input) {
          input.value = "0";
        });
        rankedItems.forEach(function(item, index) {
          var relInput = document.getElementById("relevance" + rankingName + (index + 1));
          if (relInput) {
            relInput.value = "1";
          }
        });
      }
    }
    function createControlButtons(item, qId) {
      if (item.querySelector(".ranking-controls")) return;
      var label = getItemLabel(item);
      var controls = document.createElement("span");
      controls.className = "ranking-controls";
      controls.setAttribute("role", "group");
      controls.setAttribute("aria-label", tRanking("ranking_actions_for", label));
      var btnUp = document.createElement("button");
      btnUp.type = "button";
      btnUp.className = "fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-arrow-up-line ranking-btn-up";
      btnUp.setAttribute("aria-label", tRanking("ranking_up_aria", label));
      btnUp.setAttribute("title", tRanking("ranking_up"));
      btnUp.textContent = tRanking("ranking_up");
      var btnDown = document.createElement("button");
      btnDown.type = "button";
      btnDown.className = "fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-arrow-down-line ranking-btn-down";
      btnDown.setAttribute("aria-label", tRanking("ranking_down_aria", label));
      btnDown.setAttribute("title", tRanking("ranking_down"));
      btnDown.textContent = tRanking("ranking_down");
      var btnRemove = document.createElement("button");
      btnRemove.type = "button";
      btnRemove.className = "fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-close-line ranking-btn-remove";
      btnRemove.setAttribute("aria-label", tRanking("ranking_remove_aria", label));
      btnRemove.setAttribute("title", tRanking("ranking_remove"));
      btnRemove.textContent = tRanking("ranking_remove");
      controls.appendChild(btnUp);
      controls.appendChild(btnDown);
      controls.appendChild(btnRemove);
      item.appendChild(controls);
      btnUp.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        moveItemUp(item, qId);
      });
      btnDown.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        moveItemDown(item, qId);
      });
      btnRemove.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        removeItemFromRank(item, qId);
      });
    }
    function updateControlButtonStates(qId) {
      var rankList = document.getElementById("sortable-rank-" + qId);
      if (!rankList) return;
      var items = rankList.querySelectorAll("li:not(.ls-remove):not(.d-none)");
      items.forEach(function(item, index) {
        var btnUp = item.querySelector(".ranking-btn-up");
        var btnDown = item.querySelector(".ranking-btn-down");
        if (btnUp) {
          btnUp.disabled = index === 0;
        }
        if (btnDown) {
          btnDown.disabled = index === items.length - 1;
        }
      });
    }
    function createChoiceControlButtons(item, qId) {
      if (item.querySelector(".ranking-choice-controls")) return;
      var label = getItemLabel(item);
      var controls = document.createElement("span");
      controls.className = "ranking-choice-controls";
      controls.setAttribute("role", "group");
      controls.setAttribute("aria-label", tRanking("ranking_actions_for", label));
      var btnAdd = document.createElement("button");
      btnAdd.type = "button";
      btnAdd.className = "fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-icon-arrow-right-line ranking-btn-add";
      btnAdd.setAttribute("aria-label", tRanking("ranking_add_aria", label));
      btnAdd.setAttribute("title", tRanking("ranking_add"));
      btnAdd.textContent = tRanking("ranking_add");
      controls.appendChild(btnAdd);
      item.appendChild(controls);
      btnAdd.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        addItemToRank(item, qId);
      });
    }
    function updateChoiceControlButtonStates(qId) {
      var container = document.querySelector('[data-ranking-qid="' + qId + '"]');
      if (!container) return;
      var maxAnswers = parseInt(container.dataset.maxAnswers) || 0;
      var rankList = document.getElementById("sortable-rank-" + qId);
      var choiceList = document.getElementById("sortable-choice-" + qId);
      if (!rankList || !choiceList) return;
      var rankedCount = rankList.querySelectorAll("li:not(.ls-remove):not(.d-none)").length;
      var isFull = maxAnswers > 0 && rankedCount >= maxAnswers;
      choiceList.querySelectorAll(".ranking-btn-add").forEach(function(btn) {
        btn.disabled = isFull;
      });
    }
    function updateRankNumbers(qId) {
      var rankList = document.getElementById("sortable-rank-" + qId);
      if (!rankList) return;
      var items = rankList.querySelectorAll("li:not(.ls-remove):not(.d-none)");
      var total = items.length;
      items.forEach(function(item, index) {
        var rank = index + 1;
        var badge = item.querySelector(".ranking-rank-badge");
        if (!badge) {
          badge = document.createElement("span");
          badge.className = "ranking-rank-badge";
          badge.setAttribute("aria-hidden", "true");
          item.insertBefore(badge, item.firstChild);
        }
        badge.textContent = "#" + rank;
        var label = getItemLabel(item);
        item.setAttribute("aria-label", label + " - Rang " + rank + " sur " + total + ". Entrée pour retirer, Alt+Flèches pour réordonner");
      });
      var choiceList = document.getElementById("sortable-choice-" + qId);
      if (choiceList) {
        choiceList.querySelectorAll(".ranking-rank-badge").forEach(function(badge) {
          badge.remove();
        });
        choiceList.querySelectorAll("li:not(.ls-remove):not(.d-none)").forEach(function(item) {
          var label = getItemLabel(item);
          item.setAttribute("aria-label", label + " - Appuyez sur Entrée pour ajouter au classement");
          item.setAttribute("aria-selected", "false");
        });
      }
      items.forEach(function(item) {
        item.setAttribute("aria-selected", "true");
      });
    }
    function addItemToRank(item, qId) {
      var maxAnswers = parseInt(document.querySelector('[data-ranking-qid="' + qId + '"]').dataset.maxAnswers) || 0;
      var rankList = document.getElementById("sortable-rank-" + qId);
      var currentCount = rankList.querySelectorAll("li:not(.ls-remove):not(.d-none)").length;
      if (maxAnswers > 0 && currentCount >= maxAnswers) {
        announce(qId, "Nombre maximum de réponses atteint");
        return;
      }
      rankList.appendChild(item);
      var label = getItemLabel(item);
      var newPos = rankList.querySelectorAll("li:not(.ls-remove):not(.d-none)").length;
      announce(qId, label + " ajouté au classement en position " + newPos);
      syncHiddenSelects(qId);
      refreshAllItems(qId);
      var choiceList = document.getElementById("sortable-choice-" + qId);
      var nextItem = choiceList.querySelector("li:not(.ls-remove):not(.d-none):not(.ls-irrelevant)");
      if (nextItem) {
        nextItem.focus();
      } else {
        item.focus();
      }
    }
    function removeItemFromRank(item, qId) {
      var choiceList = document.getElementById("sortable-choice-" + qId);
      var rankList = document.getElementById("sortable-rank-" + qId);
      var items = Array.from(rankList.querySelectorAll("li:not(.ls-remove):not(.d-none)"));
      var currentIndex = items.indexOf(item);
      var nextFocusItem = items[currentIndex + 1] || items[currentIndex - 1];
      choiceList.appendChild(item);
      var label = getItemLabel(item);
      announce(qId, label + " retiré du classement");
      syncHiddenSelects(qId);
      refreshAllItems(qId);
      if (nextFocusItem) {
        nextFocusItem.focus();
      } else {
        item.focus();
      }
    }
    function moveItemUp(item, qId) {
      var prev = item.previousElementSibling;
      while (prev && (prev.classList.contains("ls-remove") || prev.classList.contains("d-none"))) {
        prev = prev.previousElementSibling;
      }
      if (!prev) return;
      item.parentNode.insertBefore(item, prev);
      var label = getItemLabel(item);
      var items = item.parentNode.querySelectorAll("li:not(.ls-remove):not(.d-none)");
      var newPos = Array.from(items).indexOf(item) + 1;
      announce(qId, label + " déplacé en position " + newPos);
      syncHiddenSelects(qId);
      refreshAllItems(qId);
      item.focus();
    }
    function moveItemDown(item, qId) {
      var next = item.nextElementSibling;
      while (next && (next.classList.contains("ls-remove") || next.classList.contains("d-none"))) {
        next = next.nextElementSibling;
      }
      if (!next) return;
      item.parentNode.insertBefore(item, next.nextSibling);
      var label = getItemLabel(item);
      var items = item.parentNode.querySelectorAll("li:not(.ls-remove):not(.d-none)");
      var newPos = Array.from(items).indexOf(item) + 1;
      announce(qId, label + " déplacé en position " + newPos);
      syncHiddenSelects(qId);
      refreshAllItems(qId);
      item.focus();
    }
    function refreshAllItems(qId) {
      var rankList = document.getElementById("sortable-rank-" + qId);
      if (!rankList) return;
      _isInternalUpdate = true;
      try {
        rankList.querySelectorAll(".ranking-choice-controls").forEach(function(ctrl) {
          ctrl.remove();
        });
        rankList.querySelectorAll("li:not(.ls-remove):not(.d-none)").forEach(function(item) {
          createControlButtons(item, qId);
        });
        var choiceList = document.getElementById("sortable-choice-" + qId);
        if (choiceList) {
          choiceList.querySelectorAll(".ranking-controls").forEach(function(ctrl) {
            ctrl.remove();
          });
          choiceList.querySelectorAll("li:not(.ls-remove):not(.d-none)").forEach(function(item) {
            createChoiceControlButtons(item, qId);
          });
        }
        updateControlButtonStates(qId);
        updateChoiceControlButtonStates(qId);
        updateRankNumbers(qId);
      } finally {
        _isInternalUpdate = false;
      }
    }
    function bindKeyboardEvents(qId) {
      var choiceList = document.getElementById("sortable-choice-" + qId);
      var rankList = document.getElementById("sortable-rank-" + qId);
      if (!choiceList || !rankList) return;
      choiceList.addEventListener("keydown", function(e) {
        var item = e.target.closest("li:not(.ls-remove):not(.d-none)");
        if (!item) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          addItemToRank(item, qId);
        }
      });
      rankList.addEventListener("keydown", function(e) {
        var item = e.target.closest("li:not(.ls-remove):not(.d-none)");
        if (!item) return;
        if (e.target.tagName === "BUTTON") return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          removeItemFromRank(item, qId);
        } else if (e.key === "ArrowUp" && e.altKey) {
          e.preventDefault();
          moveItemUp(item, qId);
        } else if (e.key === "ArrowDown" && e.altKey) {
          e.preventDefault();
          moveItemDown(item, qId);
        }
      });
    }
    var _isInternalUpdate = false;
    function observeRankingLists(qId) {
      var rankList = document.getElementById("sortable-rank-" + qId);
      var choiceList = document.getElementById("sortable-choice-" + qId);
      if (!rankList || !choiceList) return;
      var observer = new MutationObserver(function(mutations) {
        if (_isInternalUpdate) return;
        var hasChildChange = mutations.some(function(m) {
          return m.type === "childList" && (m.addedNodes.length > 0 || m.removedNodes.length > 0);
        });
        if (hasChildChange) {
          refreshAllItems(qId);
        }
      });
      observer.observe(rankList, { childList: true });
      observer.observe(choiceList, { childList: true });
    }
    function initAccessibleRanking(qId) {
      bindKeyboardEvents(qId);
      observeRankingLists(qId);
      refreshAllItems(qId);
    }
    function initAllRankingQuestions() {
      var questions = document.querySelectorAll(".ranking-question-dsfr[data-ranking-qid]");
      questions.forEach(function(q) {
        var qId = q.dataset.rankingQid;
        if (qId && !q.dataset.accessibleRankingInit) {
          q.dataset.accessibleRankingInit = "true";
          setTimeout(function() {
            initAccessibleRanking(qId);
          }, 200);
        }
      });
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initAllRankingQuestions);
    } else {
      initAllRankingQuestions();
    }
    document.addEventListener("limesurvey:questionsLoaded", function() {
      setTimeout(initAllRankingQuestions, 300);
    });
    if (typeof $ !== "undefined") {
      $(document).on("pjax:complete", function() {
        setTimeout(initAllRankingQuestions, 300);
      });
    }
  })();
  function triggerEmRelevance() {
    triggerEmRelevanceQuestion();
    triggerEmRelevanceGroup();
    triggerEmRelevanceSubQuestion();
  }
  function triggerEmRelevanceQuestion() {
    $("[id^='question']").on("relevance:on", function(event, data) {
      if (event.target != this) return;
      $(this).removeClass("ls-irrelevant ls-hidden");
      $(this).find("input, textarea, select").each(function() {
        $(this).prop("disabled", false);
        $(this).removeAttr("tabindex");
      });
    });
    $("[id^='question']").on("relevance:off", function(event, data) {
      if (event.target != this) return;
      $(this).addClass("ls-irrelevant ls-hidden");
      $(this).find("input, textarea, select").each(function() {
        $(this).attr("tabindex", "-1");
      });
    });
    $(".allinone [id^='group-']:not(.ls-irrelevant) [id^='question']").on("relevance:on", function(event, data) {
      if (event.target != this) return;
      $(this).closest("[id^='group-']").removeClass("ls-hidden");
    });
    $(".allinone [id^='group-']:not(.ls-irrelevant) [id^='question']").on("relevance:off", function(event, data) {
      if (event.target != this) return;
      if ($(this).closest("[id^='group-']").find("[id^='question']").length == $(this).closest("[id^='group-']").find("[id^='question'].ls-hidden").length) {
        $(this).closest("[id^='group-']").addClass("ls-hidden");
      }
    });
  }
  function triggerEmRelevanceGroup() {
    $("[id^='group-']").on("relevance:on", function(event, data) {
      if (event.target != this) return;
      $(this).removeClass("ls-irrelevant ls-hidden");
    });
    $("[id^='group-']").on("relevance:off", function(event, data) {
      if (event.target != this) return;
      $(this).addClass("ls-irrelevant ls-hidden");
    });
  }
  function triggerEmRelevanceSubQuestion() {
    $("[id^='question']").on("relevance:on", "[id^='javatbd']", function(event, data) {
      if (event.target != this) return;
      data = $.extend({ style: "hidden" }, data);
      $(this).removeClass("ls-irrelevant ls-" + data.style);
      if (data.style == "disabled") {
        if ($(event.target).hasClass("answer-item")) {
          $(event.target).find("input").each(function(itrt, item) {
            $(item).prop("disabled", false);
          });
        } else {
          $(event.target).find(".answer-item input").each(function(itrt, item) {
            $(item).prop("disabled", false);
          });
        }
      }
      if (data.style == "hidden") {
        updateLineClass($(this));
        updateRepeatHeading($(this).closest(".ls-answers"));
      }
    });
    $("[id^='question']").on("relevance:off", "[id^='javatbd']", function(event, data) {
      if (event.target != this) return;
      data = $.extend({ style: "hidden" }, data);
      $(this).addClass("ls-irrelevant ls-" + data.style);
      if (data.style == "disabled") {
        $(event.target).find("input").each(function(itrt, item) {
          if ($(item).attr("type") == "checkbox" && $(item).prop("checked")) {
            $(item).prop("checked", false).trigger("change");
          }
          $(item).prop("disabled", true);
        });
      }
      if (data.style == "hidden") {
        updateLineClass($(this));
        updateRepeatHeading($(this).closest(".ls-answers"));
      }
    });
  }
  function updateLineClass(line) {
    if ($(line).hasClass("ls-odd") || $(line).hasClass("ls-even")) {
      $(line).closest(".ls-answers").find(".ls-odd:visible,.ls-even:visible").each(function(index) {
        $(this).removeClass("ls-odd ls-even").addClass((index + 1) % 2 == 0 ? "ls-odd" : "ls-even");
      });
    }
  }
  function updateRepeatHeading(answers) {
    $(function() {
      if ($(answers).data("repeatHeading") || $(answers).find("tbody").find(".ls-heading").length) {
        if (!$(answers).data("repeatHeading")) {
          $(answers).data("repeatHeading", $(answers).find("tbody").find(".ls-heading").first().html());
        }
        $(answers).find("tbody").find(".ls-heading").remove();
        var repeatHeading = $(answers).data("repeatHeading");
        $(answers).find("tbody").find("tr:visible").each(function(index) {
          if (repeatHeading && index > 0 && index % repeatHeading == 0) {
            $(this).before("<tr class='ls-heading'>" + repeatHeading + "</tr>");
          }
        });
      }
    });
  }
  (function() {
    "use strict";
    function initRelevanceHandlers() {
      triggerEmRelevance();
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initRelevanceHandlers);
    } else {
      setTimeout(initRelevanceHandlers, 100);
    }
    $(document).on("pjax:complete", initRelevanceHandlers);
    document.addEventListener("limesurvey:questionsLoaded", initRelevanceHandlers);
  })();
  if (typeof window !== "undefined") {
    window.triggerEmRelevance = triggerEmRelevance;
    window.triggerEmRelevanceQuestion = triggerEmRelevanceQuestion;
    window.triggerEmRelevanceGroup = triggerEmRelevanceGroup;
    window.triggerEmRelevanceSubQuestion = triggerEmRelevanceSubQuestion;
    window.updateLineClass = updateLineClass;
    window.updateRepeatHeading = updateRepeatHeading;
  }

  // modules/theme-dsfr/src/core/runtime.js
  function onReady(cb) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", cb);
    } else {
      cb();
    }
  }
  function onQuestionsLoaded(cb) {
    document.addEventListener("limesurvey:questionsLoaded", cb);
  }
  function onPjax(cb) {
    if (typeof window.$ !== "undefined") {
      window.$(document).on("pjax:complete", cb);
    }
  }

  // modules/theme-dsfr/src/rte/sanitize-constants.js
  var RTE_STYLE_PROPERTIES = [
    "color",
    "background-color",
    "background",
    "font-size",
    "font-family",
    "font-weight",
    "font-style",
    "text-decoration",
    "text-align",
    "line-height",
    "letter-spacing",
    "text-transform",
    "text-indent",
    "margin",
    "margin-top",
    "margin-right",
    "margin-bottom",
    "margin-left",
    "padding",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    "border",
    "border-color",
    "border-width",
    "border-style"
  ];
  var RTE_CONTENT_SELECTORS = [
    ".question-title-container",
    ".question-help-container"
  ];

  // modules/theme-dsfr/src/rte/sanitize.js
  function shouldSkipElement(element) {
    if (!element) return true;
    if (element.classList && (element.classList.contains("required-asterisk") || element.classList.contains("asterisk"))) return true;
    if (element.tagName === "IMG") return true;
    if (element.querySelector && element.querySelector("img")) return true;
    if (element.closest && element.closest('[class*="upload"]')) return true;
    if (element.closest && element.closest('[class*="file"]')) return true;
    return false;
  }
  function sanitizeElementStyles(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;
    if (shouldSkipElement(element)) return;
    if (!element.hasAttribute("style")) return;
    RTE_STYLE_PROPERTIES.forEach((prop) => {
      element.style.removeProperty(prop);
    });
    if (element.getAttribute("style") === "" || element.style.cssText.trim() === "") {
      element.removeAttribute("style");
    }
  }
  function sanitizeTree(root) {
    if (!root) return;
    sanitizeElementStyles(root);
    const children = root.querySelectorAll("*");
    children.forEach((child) => {
      sanitizeElementStyles(child);
    });
  }
  function sanitizeRTEContent() {
    if (typeof window.LSThemeOptions === "undefined" || window.LSThemeOptions.sanitize_rte_content !== "on") {
      return;
    }
    console.log("[DSFR] Nettoyage du contenu RTE...");
    RTE_CONTENT_SELECTORS.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          sanitizeTree(element);
        });
      } catch (e) {
      }
    });
    console.log("[DSFR] Contenu RTE nettoyé");
  }

  // modules/theme-dsfr/src/a11y/lazy-images.js
  var IMAGE_SELECTORS = [
    ".answer-item img",
    ".fr-fieldset__content img",
    ".answertext img",
    ".fr-checkbox-group img",
    ".fr-radio-group img",
    ".question-text-container img",
    ".ls-question-text img",
    ".ls-question-help img"
  ];
  function enableImageLazyLoading() {
    const images = document.querySelectorAll(IMAGE_SELECTORS.join(", "));
    images.forEach(function(img) {
      if (!img.hasAttribute("loading")) {
        img.setAttribute("loading", "lazy");
      }
      if (!img.hasAttribute("alt") || img.getAttribute("alt").trim() === "") {
        const altText = img.hasAttribute("title") && img.getAttribute("title").trim() !== "" ? img.getAttribute("title") : "Image de réponse";
        img.setAttribute("alt", altText);
      }
      if (!img.classList.contains("dsfr-enhanced-image")) {
        img.classList.add("dsfr-enhanced-image");
      }
    });
  }

  // modules/theme-dsfr/src/a11y/table-accessibility.js
  function fixTableAccessibility() {
    const tables = document.querySelectorAll(".ls-answers table, .ls-table-wrapper table, .fr-table table");
    tables.forEach(function(table) {
      const tbodyRows = table.querySelectorAll("tbody tr");
      tbodyRows.forEach(function(tr) {
        const th = tr.querySelector("th");
        if (th && !th.hasAttribute("scope")) {
          th.setAttribute("scope", "row");
        }
      });
      const theadThs = table.querySelectorAll("thead th");
      theadThs.forEach(function(th) {
        if (!th.hasAttribute("scope")) {
          th.setAttribute("scope", "col");
        }
      });
      const hasColHeaders = table.querySelectorAll("thead th[id]").length > 0;
      const hasRowHeaders = table.querySelectorAll("tbody th[id]").length > 0;
      if (hasColHeaders && hasRowHeaders) {
        const colHeaderIds = [];
        const headerRow = table.querySelector("thead tr:last-child");
        if (headerRow) {
          let thIndex = 0;
          headerRow.querySelectorAll("th").forEach(function(th) {
            if (th.id) {
              colHeaderIds[thIndex] = th.id;
            }
            thIndex++;
          });
        }
        tbodyRows.forEach(function(tr) {
          const rowTh = tr.querySelector("th[id]");
          if (!rowTh) return;
          const rowHeaderId = rowTh.id;
          let cellIndex = 0;
          tr.querySelectorAll("td, th").forEach(function(cell) {
            if (cell.tagName === "TH") {
              cellIndex++;
              return;
            }
            if (!cell.hasAttribute("headers") && colHeaderIds[cellIndex]) {
              cell.setAttribute("headers", rowHeaderId + " " + colHeaderIds[cellIndex]);
            }
            cellIndex++;
          });
        });
      }
      let needsIds = false;
      const allTheadThs = table.querySelectorAll("thead th");
      const allTbodyThs = table.querySelectorAll("tbody th");
      allTheadThs.forEach(function(th) {
        if (!th.id && th.textContent.trim()) needsIds = true;
      });
      allTbodyThs.forEach(function(th) {
        if (!th.id && th.textContent.trim()) needsIds = true;
      });
      if (needsIds) {
        const tableId = table.id || "tbl-" + Math.random().toString(36).substr(2, 6);
        const colIds = [];
        allTheadThs.forEach(function(th, i) {
          if (!th.id && th.textContent.trim()) {
            th.id = tableId + "-col-" + i;
          }
          colIds[i] = th.id || null;
        });
        tbodyRows.forEach(function(tr) {
          const th = tr.querySelector("th");
          if (!th) return;
          if (!th.id && th.textContent.trim()) {
            const rowName = tr.id || "row-" + Math.random().toString(36).substr(2, 6);
            th.id = tableId + "-" + rowName;
          }
          if (!th.id) return;
          let cellIndex = 0;
          tr.querySelectorAll("td, th").forEach(function(cell) {
            if (cell.tagName === "TH") {
              cellIndex++;
              return;
            }
            if (!cell.hasAttribute("headers") && colIds[cellIndex]) {
              cell.setAttribute("headers", th.id + " " + colIds[cellIndex]);
            }
            cellIndex++;
          });
        });
      }
    });
  }

  // modules/theme-dsfr/src/inputs/numeric-inputmode.js
  function addInputmodeNumericToNumericFields() {
    const numericInputs = document.querySelectorAll('input[data-number="1"]');
    numericInputs.forEach(function(input) {
      if (input.dataset.inputmodeWired === "1") return;
      if (!input.hasAttribute("inputmode")) {
        input.setAttribute("inputmode", "numeric");
      }
      input.dataset.inputmodeWired = "1";
    });
  }

  // modules/theme-dsfr/src/inputs/listradio-no-answer.js
  function reorderListRadioNoAnswer() {
    const questions = document.querySelectorAll(".list-radio.question-container");
    questions.forEach(function(q) {
      if (q.dataset.listradioReordered === "1") return;
      const noAnswerRadio = q.querySelector('input[type="radio"][value=""]');
      if (!noAnswerRadio) return;
      const noAnswerRow = noAnswerRadio.closest(".fr-fieldset__element");
      if (!noAnswerRow) return;
      const content = noAnswerRow.parentNode;
      if (content && content.firstElementChild !== noAnswerRow) {
        content.insertBefore(noAnswerRow, content.firstElementChild);
      }
      const allRadios = q.querySelectorAll('input[type="radio"][name="' + noAnswerRadio.name + '"]');
      const anyChecked = Array.prototype.some.call(allRadios, function(r) {
        return r.checked;
      });
      const otherRadio = q.querySelector('input[type="radio"][id^="SOTH"]');
      let isIncompleteOther = false;
      if (otherRadio && otherRadio.checked) {
        const otherText = q.querySelector('[id$="othertext"]');
        if (otherText && otherText.value.trim() === "") {
          isIncompleteOther = true;
        }
      }
      if (!anyChecked || isIncompleteOther) {
        allRadios.forEach(function(r) {
          r.checked = false;
          r.removeAttribute("checked");
        });
        noAnswerRadio.checked = true;
        noAnswerRadio.setAttribute("checked", "checked");
        const javaInput = q.querySelector('input[type="hidden"][id^="java"]');
        if (javaInput) {
          javaInput.value = "";
        }
        if (otherRadio) {
          otherRadio.setAttribute("aria-expanded", "false");
        }
      }
      q.dataset.listradioReordered = "1";
    });
  }

  // modules/theme-dsfr/src/validation/described-by.js
  function extendDescribedByForValidationTips() {
    const tips = document.querySelectorAll('.ls-questionhelp[id^="vmsg_"]');
    tips.forEach(function(tip) {
      if (tip.dataset.describedbyWired === "1") return;
      const question = tip.closest('[id^="question"]');
      if (!question) return;
      const fields = question.querySelectorAll("input, textarea, select");
      fields.forEach(function(field) {
        if (field.type === "hidden") return;
        const existing = field.getAttribute("aria-describedby") || "";
        const ids = existing.split(/\s+/).filter(Boolean);
        if (ids.indexOf(tip.id) === -1) {
          ids.push(tip.id);
          field.setAttribute("aria-describedby", ids.join(" "));
        }
      });
      tip.dataset.describedbyWired = "1";
    });
  }

  // modules/theme-dsfr/src/validation/required-fields.js
  function handleRequiredFields() {
    const requiredFields = document.querySelectorAll('input[required], textarea[required], select[required], input[aria-required="true"], textarea[aria-required="true"], select[aria-required="true"]');
    const mandatoryQuestions = document.querySelectorAll('.mandatory.question-container, .mandatory[id^="question"], .question-container:has(.mandatory-question)');
    const mandatoryBadges = document.querySelectorAll('.fr-badge[aria-label*="Mandatory"], .fr-badge[aria-label*="Obligatoire"]');
    if (requiredFields.length === 0 && mandatoryQuestions.length === 0 && mandatoryBadges.length === 0) {
      return;
    }
    requiredFields.forEach((field) => {
      let label = null;
      if (field.id) {
        label = document.querySelector(`label[for="${field.id}"]`);
      }
      if (!label) {
        label = field.closest("label");
      }
      if (!label) {
        const inputGroup = field.closest(".fr-input-group, .fr-fieldset__element");
        if (inputGroup) {
          label = inputGroup.querySelector(".fr-label, .fr-fieldset__legend");
        }
      }
      if (!label) {
        const fieldset = field.closest("fieldset");
        if (fieldset) {
          label = fieldset.querySelector(".fr-fieldset__legend");
        }
      }
      if (!label && field.getAttribute("aria-labelledby")) {
        const labelId = field.getAttribute("aria-labelledby");
        label = document.getElementById(labelId);
      }
      if (label && !label.classList.contains("has-required-field")) {
        label.classList.add("has-required-field");
      }
    });
    mandatoryQuestions.forEach((question) => {
      let questionLabel = question.querySelector(".question-text");
      if (!questionLabel) {
        questionLabel = question.querySelector(".ls-label-question");
      }
      if (!questionLabel) return;
      const alreadyHasAsterisk = questionLabel.classList.contains("asterisk-injected") || questionLabel.querySelector(".required-asterisk") || questionLabel.querySelector(".asterisk");
      if (!alreadyHasAsterisk) {
        questionLabel.classList.add("asterisk-injected");
        const asterisk = document.createElement("span");
        asterisk.className = "required-asterisk";
        asterisk.style.color = "var(--text-default-error)";
        asterisk.style.fontWeight = "700";
        asterisk.style.marginRight = "0.25rem";
        asterisk.setAttribute("aria-hidden", "true");
        asterisk.textContent = "* ";
        const lastStructuralElement = questionLabel.querySelector(".question-code") || questionLabel.querySelector(".question-number");
        if (lastStructuralElement && lastStructuralElement.nextSibling) {
          questionLabel.insertBefore(asterisk, lastStructuralElement.nextSibling);
        } else {
          questionLabel.insertBefore(asterisk, questionLabel.firstChild);
        }
      }
      const inputs = question.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], input[type="tel"], textarea, select');
      inputs.forEach((input) => {
        if (input.type !== "hidden" && !input.disabled && !input.hasAttribute("aria-required")) {
          input.setAttribute("aria-required", "true");
        }
      });
    });
    if (document.getElementById("required-fields-notice")) {
      return;
    }
    const noticeHTML = `<p class="fr-text--sm" style="color: var(--text-mention-grey);"><span class="fr-icon-error-warning-line" aria-hidden="true" style="margin-right: 0.5rem;"></span>Les champs marqués d'un <span style="color: var(--text-default-error); font-weight: 700;">*</span> sont obligatoires</p>`;
    const antibotContainer = document.querySelector("#antibot-challenge-container");
    if (antibotContainer) {
      const centeredCol = antibotContainer.querySelector(".fr-mx-auto, .fr-col-md-8");
      if (centeredCol) {
        const notice2 = document.createElement("div");
        notice2.id = "required-fields-notice";
        notice2.className = "fr-mb-2w";
        notice2.innerHTML = noticeHTML;
        centeredCol.insertBefore(notice2, centeredCol.firstChild);
        return;
      }
    }
    const welcomeContainer = document.querySelector('#welcome-page-wrapper .fr-container, [id*="welcome"] .fr-col-12, [class*="welcomecontainer"]');
    if (welcomeContainer) {
      const innerCol = welcomeContainer.querySelector(".fr-col-12") || welcomeContainer;
      const firstTitle = innerCol.querySelector("h1, h2");
      if (firstTitle) {
        const notice2 = document.createElement("div");
        notice2.id = "required-fields-notice";
        notice2.className = "fr-mb-2w";
        notice2.innerHTML = noticeHTML;
        innerCol.insertBefore(notice2, firstTitle);
        return;
      }
    }
    const saveMessage = document.querySelector(".save-message");
    if (saveMessage) {
      const notice2 = document.createElement("div");
      notice2.id = "required-fields-notice";
      notice2.className = "fr-mb-2w";
      notice2.innerHTML = noticeHTML;
      saveMessage.parentElement.insertBefore(notice2, saveMessage);
      return;
    }
    const captchaForm = document.querySelector(".form-captcha");
    if (captchaForm) {
      const notice2 = document.createElement("div");
      notice2.id = "required-fields-notice";
      notice2.className = "fr-container fr-my-2w";
      notice2.innerHTML = noticeHTML;
      const formParent = captchaForm.parentElement;
      if (formParent) {
        formParent.insertBefore(notice2, captchaForm);
        return;
      }
    }
    const notice = document.createElement("div");
    notice.id = "required-fields-notice";
    notice.className = "fr-my-3w";
    notice.innerHTML = noticeHTML;
    const firstGroup = document.querySelector('[id^="group-"]');
    if (firstGroup) {
      const firstQuestion2 = firstGroup.querySelector('[id^="question"]');
      if (firstQuestion2) {
        firstQuestion2.parentElement.insertBefore(notice, firstQuestion2);
        return;
      }
    }
    const firstQuestion = document.querySelector('[id^="question"], .question-container, .ls-question, .question-item');
    if (firstQuestion) {
      firstQuestion.parentElement.insertBefore(notice, firstQuestion);
      return;
    }
    const mainContent = document.querySelector("#main-col, .ls-survey-content, .survey-content, .main-content");
    if (mainContent) {
      const lastAlert = mainContent.querySelector(".fr-alert:last-of-type, .error-messages:last-of-type");
      if (lastAlert) {
        lastAlert.insertAdjacentElement("afterend", notice);
      } else {
        mainContent.insertBefore(notice, mainContent.firstChild);
      }
      return;
    }
    const firstContainer = document.querySelector('[id^="group-"], .fr-container');
    if (firstContainer) {
      firstContainer.insertBefore(notice, firstContainer.firstChild);
    }
  }

  // modules/theme-dsfr/src/validation/mst-errors.js
  function handleMultipleShortTextErrors() {
    var multipleQuestions = document.querySelectorAll(".question-container.multiple-short-txt");
    multipleQuestions.forEach(function(question) {
      if (!question.classList.contains("input-error")) {
        return;
      }
      if (question.dataset.mandatoryCounterAttached) {
        return;
      }
      question.dataset.mandatoryCounterAttached = "true";
      var legacyMessages = question.querySelectorAll(
        ".ls-question-mandatory, .ls-question-mandatory-initial, .ls-question-mandatory-array"
      );
      legacyMessages.forEach(function(msg) {
        msg.style.display = "none";
      });
      var validContainer = question.querySelector(".question-valid-container");
      if (validContainer) {
        validContainer.style.display = "none";
      }
      var allItems = question.querySelectorAll(".answer-item:not(.d-none)");
      allItems.forEach(function(item) {
        var inputGroup = item.querySelector(".fr-input-group");
        var messagesGroup = item.querySelector(".fr-messages-group");
        if (inputGroup) {
          inputGroup.classList.remove("fr-input-group--error");
        }
        if (messagesGroup) {
          var existingError = messagesGroup.querySelector(".fr-message--error");
          if (existingError) existingError.remove();
        }
        item.classList.remove("input-error", "ls-error-mandatory", "has-error");
      });
      var counterContainer = document.createElement("div");
      counterContainer.className = "fr-messages-group fr-mt-2w";
      counterContainer.setAttribute("aria-live", "polite");
      counterContainer.id = "mandatory-counter-" + (question.id || Math.random().toString(36).substring(2, 11));
      var counterMessage = document.createElement("p");
      counterMessage.className = "fr-message fr-message--error";
      counterMessage.setAttribute("role", "status");
      counterContainer.appendChild(counterMessage);
      var answersList = question.querySelector(".ls-answers, .subquestion-list");
      if (answersList) {
        answersList.parentNode.insertBefore(counterContainer, answersList.nextSibling);
      } else {
        question.appendChild(counterContainer);
      }
      function updateCounter() {
        var visibleItems = question.querySelectorAll(".answer-item:not(.d-none)");
        var totalFields = visibleItems.length;
        var emptyCount = 0;
        visibleItems.forEach(function(item) {
          var input = item.querySelector("input, textarea");
          if (!input) return;
          var value = input.value ? input.value.trim() : "";
          var inputGroup = item.querySelector(".fr-input-group");
          var messagesGroup = item.querySelector(".fr-messages-group");
          if (value === "") {
            emptyCount++;
            if (inputGroup) {
              inputGroup.classList.remove("fr-input-group--valid", "fr-input-group--error");
            }
            if (messagesGroup) {
              var fmtErr = messagesGroup.querySelector(".fr-message--error");
              if (fmtErr) fmtErr.remove();
              var fmtOk = messagesGroup.querySelector(".fr-message--valid");
              if (fmtOk) fmtOk.remove();
            }
            input.classList.remove("fr-input--error", "fr-input--valid", "error");
          } else {
            var isNumberOnly = input.dataset.number === "1";
            var isInvalidNumber = isNumberOnly && !/^-?\d*[.,]?\d+$/.test(value);
            if (isInvalidNumber) {
              emptyCount++;
              if (inputGroup) {
                inputGroup.classList.add("fr-input-group--error");
                inputGroup.classList.remove("fr-input-group--valid");
              }
              input.classList.add("fr-input--error");
              input.classList.remove("fr-input--valid");
              if (messagesGroup && !messagesGroup.querySelector(".fr-message--error")) {
                var fmtMsg = document.createElement("p");
                fmtMsg.className = "fr-message fr-message--error";
                fmtMsg.textContent = tMandatory("numeric_only");
                messagesGroup.appendChild(fmtMsg);
              }
            } else {
              if (inputGroup) {
                inputGroup.classList.remove("fr-input-group--error");
                inputGroup.classList.add("fr-input-group--valid");
              }
              input.classList.remove("fr-input--error", "error");
              input.classList.add("fr-input--valid");
              if (messagesGroup) {
                var fmtErr2 = messagesGroup.querySelector(".fr-message--error");
                if (fmtErr2) fmtErr2.remove();
              }
            }
          }
        });
        if (emptyCount === 0) {
          counterContainer.remove();
          question.classList.remove("input-error", "fr-input-group--error");
          question.classList.add("input-valid");
          if (typeof updateErrorSummary === "function") {
            setTimeout(updateErrorSummary, 50);
          }
        } else {
          question.classList.add("input-error");
          question.classList.remove("input-valid");
          if (emptyCount === totalFields) {
            counterMessage.textContent = tMandatory("fields_all_required", null, totalFields);
          } else if (emptyCount === 1) {
            counterMessage.textContent = tMandatory("fields_remaining_singular");
          } else {
            counterMessage.textContent = tMandatory("fields_remaining_plural", emptyCount, totalFields);
          }
          if (typeof updateErrorSummary === "function") {
            setTimeout(updateErrorSummary, 50);
          }
        }
      }
      updateCounter();
      allItems.forEach(function(item) {
        var input = item.querySelector("input, textarea");
        if (!input || input.dataset.errorListenerAdded) return;
        input.dataset.errorListenerAdded = "true";
        input.addEventListener("input", updateCounter);
      });
    });
  }

  // modules/theme-dsfr/src/validation/errors-dsfr.js
  function transformErrorsToDsfr() {
    const errorQuestions = document.querySelectorAll(".question-container.input-error");
    errorQuestions.forEach(function(question) {
      question.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(function(field) {
        field.setAttribute("aria-invalid", "true");
      });
    });
    errorQuestions.forEach(function(question) {
      if (question.classList.contains("multiple-short-txt")) {
        return;
      }
      if (question.className.match(/array-/)) {
        return;
      }
      const inputGroup = question.querySelector(".fr-input-group");
      if (!inputGroup) {
        return;
      }
      const messagesGroup = inputGroup.querySelector(".fr-messages-group");
      if (!messagesGroup) {
        return;
      }
      const existingError = messagesGroup.querySelector(".fr-message--error");
      if (existingError) {
        return;
      }
      inputGroup.classList.add("fr-input-group--error");
      let lsErrorContainer = null;
      let errorText = "";
      const inputElement = question.querySelector(".fr-input, input, textarea, select");
      const isEmpty = !inputElement || !inputElement.value || inputElement.value.trim() === "";
      const mandatoryError = question.querySelector(".ls-question-mandatory");
      const validationErrors = question.querySelectorAll(".ls-em-tip, .em_num_answers, .ls-em-error");
      if (isEmpty && mandatoryError) {
        lsErrorContainer = mandatoryError;
      } else {
        for (let i = 0; i < validationErrors.length; i++) {
          const error = validationErrors[i];
          if (error.offsetParent !== null) {
            lsErrorContainer = error;
            break;
          }
        }
        if (!lsErrorContainer && mandatoryError) {
          lsErrorContainer = mandatoryError;
        }
      }
      if (!lsErrorContainer) {
        return;
      }
      errorText = lsErrorContainer.textContent.trim();
      errorText = errorText.replace(/\s+/g, " ").trim();
      if (!errorText) {
        return;
      }
      const errorMessage = document.createElement("p");
      errorMessage.className = "fr-message fr-message--error";
      errorMessage.id = messagesGroup.id + "-error";
      errorMessage.textContent = errorText;
      errorMessage.setAttribute("role", "alert");
      messagesGroup.appendChild(errorMessage);
      const questionValidContainer = question.querySelector(".question-valid-container");
      if (questionValidContainer) {
        questionValidContainer.style.display = "none";
      }
      attachErrorRemovalListeners(question, inputGroup, messagesGroup);
    });
  }
  function attachErrorRemovalListeners(question, inputGroup, messagesGroup) {
    if (question.dataset.dsfrErrorListeners) {
      return;
    }
    question.dataset.dsfrErrorListeners = "true";
    function validateAndUpdateState(input) {
      const value = input.value ? input.value.trim() : "";
      const isNumberOnly = input.dataset.number === "1";
      if (value === "") {
        inputGroup.classList.add("fr-input-group--error");
        inputGroup.classList.remove("fr-input-group--valid");
        question.classList.add("input-error");
        question.classList.remove("input-valid");
        input.classList.add("fr-input--error");
        input.classList.remove("fr-input--valid");
        input.setAttribute("aria-invalid", "true");
        const validMessage = messagesGroup.querySelector(".fr-message--valid");
        if (validMessage) {
          validMessage.remove();
        }
        if (!messagesGroup.querySelector(".fr-message--error")) {
          const newErrorMessage = document.createElement("p");
          newErrorMessage.className = "fr-message fr-message--error";
          newErrorMessage.id = messagesGroup.id + "-error";
          newErrorMessage.textContent = "Ce champ est obligatoire";
          newErrorMessage.setAttribute("role", "alert");
          messagesGroup.appendChild(newErrorMessage);
        }
        return;
      }
      if (isNumberOnly) {
        const isValidNumber2 = /^-?\d+([.,]\d*)?$/.test(value) || /^-?\d*[.,]\d+$/.test(value);
        if (!isValidNumber2) {
          inputGroup.classList.add("fr-input-group--error");
          inputGroup.classList.remove("fr-input-group--valid");
          question.classList.add("input-error");
          question.classList.remove("input-valid");
          input.classList.add("fr-input--error");
          input.classList.remove("fr-input--valid");
          input.setAttribute("aria-invalid", "true");
          const validMessage = messagesGroup.querySelector(".fr-message--valid");
          if (validMessage) {
            validMessage.remove();
          }
          let errorMsg2 = messagesGroup.querySelector(".fr-message--error");
          if (!errorMsg2) {
            errorMsg2 = document.createElement("p");
            errorMsg2.className = "fr-message fr-message--error";
            errorMsg2.id = messagesGroup.id + "-error";
            errorMsg2.setAttribute("role", "alert");
            messagesGroup.appendChild(errorMsg2);
          }
          errorMsg2.textContent = "Ce champ n'accepte que des chiffres. Les caractères non numériques sont automatiquement supprimés.";
          setTimeout(updateErrorSummary, 50);
          return;
        }
      }
      inputGroup.classList.remove("fr-input-group--error");
      question.classList.remove("input-error");
      input.classList.remove("fr-input--error");
      input.removeAttribute("aria-invalid");
      const errorMsg = messagesGroup.querySelector(".fr-message--error");
      if (errorMsg) {
        errorMsg.remove();
        question.dataset.hadError = "true";
      }
      if (question.dataset.hadError === "true") {
        inputGroup.classList.add("fr-input-group--valid");
        question.classList.add("input-valid");
        input.classList.add("fr-input--valid");
        let validMessage = messagesGroup.querySelector(".fr-message--valid");
        if (!validMessage) {
          validMessage = document.createElement("p");
          validMessage.className = "fr-message fr-message--valid";
          validMessage.id = messagesGroup.id + "-valid";
          messagesGroup.appendChild(validMessage);
        }
        validMessage.textContent = "Merci d'avoir répondu";
      }
      setTimeout(updateErrorSummary, 50);
    }
    const inputs = question.querySelectorAll('.fr-input, input[type="text"], input[type="number"], textarea, select');
    inputs.forEach(function(input) {
      input.addEventListener("input", function() {
        validateAndUpdateState(input);
      });
      input.addEventListener("change", function() {
        validateAndUpdateState(input);
      });
    });
    const radiosCheckboxes = question.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    radiosCheckboxes.forEach(function(input) {
      input.addEventListener("change", function() {
        inputGroup.classList.remove("fr-input-group--error");
        question.classList.remove("input-error");
        question.querySelectorAll("[aria-invalid]").forEach(function(f) {
          f.removeAttribute("aria-invalid");
        });
        const errorMsg = messagesGroup.querySelector(".fr-message--error");
        if (errorMsg) {
          errorMsg.remove();
          question.dataset.hadError = "true";
        }
        if (question.dataset.hadError === "true") {
          inputGroup.classList.add("fr-input-group--valid");
          question.classList.add("input-valid");
          let validMessage = messagesGroup.querySelector(".fr-message--valid");
          if (!validMessage) {
            validMessage = document.createElement("p");
            validMessage.className = "fr-message fr-message--valid";
            validMessage.id = messagesGroup.id + "-valid";
            messagesGroup.appendChild(validMessage);
          }
          validMessage.textContent = "Merci d'avoir répondu";
        }
        setTimeout(updateErrorSummary, 50);
      }, { once: true });
    });
  }
  function observeErrorChanges() {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          const target = mutation.target;
          if (target.classList.contains("question-container") && target.classList.contains("input-error")) {
            setTimeout(function() {
              transformErrorsToDsfr();
              handleMultipleShortTextErrors();
              handleArrayValidation();
            }, 100);
          }
        }
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1 && node.classList && node.classList.contains("input-error")) {
              setTimeout(function() {
                transformErrorsToDsfr();
                handleMultipleShortTextErrors();
                handleArrayValidation();
              }, 100);
            }
          });
        }
      });
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
      childList: true,
      subtree: true
    });
  }

  // modules/theme-dsfr/src/validation/aria-invalid-sync.js
  function syncAriaInvalidInContainer(container, hasError) {
    var fields = container.querySelectorAll("input, textarea, select");
    fields.forEach(function(field) {
      if (field.type === "hidden" || field.id && field.id.indexOf("java") === 0) return;
      if (hasError) {
        field.setAttribute("aria-invalid", "true");
      } else {
        field.removeAttribute("aria-invalid");
      }
    });
  }
  function syncAllErrorFields() {
    document.querySelectorAll(".fr-input--error, input.error, textarea.error, select.error").forEach(function(input) {
      input.setAttribute("aria-invalid", "true");
    });
    document.querySelectorAll(".question-container.input-error, .fr-input-group--error").forEach(function(container) {
      syncAriaInvalidInContainer(container, true);
    });
  }
  function initAriaInvalidSync() {
    syncAllErrorFields();
    setTimeout(syncAllErrorFields, 0);
    setTimeout(syncAllErrorFields, 50);
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type !== "attributes" || mutation.attributeName !== "class") return;
        var el = mutation.target;
        if (el.matches && el.matches("input, textarea, select")) {
          var hasFieldError = el.classList.contains("fr-input--error") || el.classList.contains("error");
          var parentContainer = el.closest(".question-container");
          var hasContainerError = parentContainer && parentContainer.classList.contains("input-error");
          if (hasFieldError || hasContainerError) {
            el.setAttribute("aria-invalid", "true");
          } else {
            el.removeAttribute("aria-invalid");
          }
        }
        if (el.classList && el.classList.contains("question-container")) {
          var containerError = el.classList.contains("input-error");
          syncAriaInvalidInContainer(el, containerError);
        }
        if (el.classList && el.classList.contains("fr-input-group")) {
          var groupError = el.classList.contains("fr-input-group--error");
          syncAriaInvalidInContainer(el, groupError);
        }
      });
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
      subtree: true
    });
  }

  // modules/theme-dsfr/src/validation/numeric-validation.js
  function initNumericValidation() {
    const numericInputs = document.querySelectorAll('input[data-number="1"]');
    numericInputs.forEach(function(input) {
      if (input.dataset.numericValidationAttached) {
        return;
      }
      input.dataset.numericValidationAttached = "true";
      input.addEventListener("input", function() {
        const value = this.value.trim();
        const question = this.closest(".question-container");
        const inputGroup = this.closest(".fr-input-group");
        if (!question || !inputGroup) return;
        const messagesGroup = inputGroup.querySelector(".fr-messages-group");
        if (!messagesGroup) return;
        if (value === "") {
          const errorMessage = messagesGroup.querySelector(".fr-message--error");
          if (errorMessage) {
            errorMessage.remove();
          }
          const validMessage = messagesGroup.querySelector(".fr-message--valid");
          if (validMessage) {
            validMessage.remove();
          }
          inputGroup.classList.remove("fr-input-group--error", "fr-input-group--valid");
          return;
        }
        const isValidNumber2 = /^-?\d+([.,]\d*)?$/.test(value) || /^-?\d*[.,]\d+$/.test(value);
        if (!isValidNumber2) {
          question.classList.add("input-error");
          inputGroup.classList.add("fr-input-group--error");
          inputGroup.classList.remove("fr-input-group--valid");
          this.classList.add("fr-input--error");
          this.classList.remove("fr-input--valid");
          const validMessage = messagesGroup.querySelector(".fr-message--valid");
          if (validMessage) {
            validMessage.remove();
          }
          let errorMessage = messagesGroup.querySelector(".fr-message--error");
          if (!errorMessage) {
            errorMessage = document.createElement("p");
            errorMessage.className = "fr-message fr-message--error";
            errorMessage.id = messagesGroup.id + "-error";
            errorMessage.setAttribute("role", "alert");
            messagesGroup.appendChild(errorMessage);
          }
          errorMessage.textContent = "Ce champ n'accepte que des chiffres. Les caractères non numériques sont automatiquement supprimés.";
        } else {
          question.classList.remove("input-error");
          inputGroup.classList.remove("fr-input-group--error");
          this.classList.remove("fr-input--error");
          const errorMessage = messagesGroup.querySelector(".fr-message--error");
          if (errorMessage) {
            errorMessage.remove();
            question.dataset.hadError = "true";
          }
          if (question.dataset.hadError === "true") {
            question.classList.add("input-valid");
            inputGroup.classList.add("fr-input-group--valid");
            this.classList.add("fr-input--valid");
            let validMessage = messagesGroup.querySelector(".fr-message--valid");
            if (!validMessage) {
              validMessage = document.createElement("p");
              validMessage.className = "fr-message fr-message--valid";
              validMessage.id = messagesGroup.id + "-valid";
              messagesGroup.appendChild(validMessage);
            }
            validMessage.textContent = "Merci d'avoir répondu";
          }
          setTimeout(updateErrorSummary, 50);
        }
      });
    });
  }
  function handleNumericMultiValidation() {
    const numericMultiQuestions = document.querySelectorAll(".question-container.numeric-multi");
    numericMultiQuestions.forEach(function(question) {
      if (question.dataset.dsfrNumericMultiInit) {
        return;
      }
      question.dataset.dsfrNumericMultiInit = "true";
      const initialErrorMessage = question.querySelector(".ls-question-mandatory-initial");
      if (initialErrorMessage) {
        initialErrorMessage.style.display = "none";
      }
      const arrayErrorMessage = question.querySelector(".ls-question-mandatory-array");
      if (arrayErrorMessage && !arrayErrorMessage.classList.contains("fr-message")) {
        const dsfrMessage = document.createElement("p");
        dsfrMessage.className = "fr-message fr-message--error";
        dsfrMessage.textContent = arrayErrorMessage.textContent.trim().replace(/\s+/g, " ");
        dsfrMessage.setAttribute("role", "alert");
        arrayErrorMessage.style.display = "none";
        arrayErrorMessage.parentNode.insertBefore(dsfrMessage, arrayErrorMessage.nextSibling);
      }
      const numericInputs = question.querySelectorAll('input.numeric[data-number="1"]');
      numericInputs.forEach(function(input) {
        const listItem = input.closest("li.question-item");
        if (!listItem) return;
        let inputGroup = input.closest(".fr-input-group");
        if (!inputGroup) {
          inputGroup = document.createElement("div");
          inputGroup.className = "fr-input-group";
          const parent = input.parentNode;
          parent.insertBefore(inputGroup, input);
          inputGroup.appendChild(input);
          const messagesGroup = document.createElement("div");
          messagesGroup.className = "fr-messages-group";
          messagesGroup.id = input.id + "-messages";
          messagesGroup.setAttribute("aria-live", "polite");
          inputGroup.appendChild(messagesGroup);
          input.setAttribute("aria-describedby", messagesGroup.id);
        }
        if (listItem.classList.contains("ls-error-mandatory") || listItem.classList.contains("has-error")) {
          input.classList.add("fr-input--error");
          if (inputGroup) {
            inputGroup.classList.add("fr-input-group--error");
          }
          const messagesGroup = inputGroup.querySelector(".fr-messages-group");
          if (messagesGroup && (!input.value || input.value.trim() === "")) {
            let errorMsg = messagesGroup.querySelector(".fr-message--error");
            if (!errorMsg) {
              errorMsg = document.createElement("p");
              errorMsg.className = "fr-message fr-message--error";
              errorMsg.setAttribute("role", "alert");
              messagesGroup.appendChild(errorMsg);
            }
            errorMsg.textContent = "Ce champ est obligatoire";
          }
          const lsEmError = listItem.querySelector(".ls-em-error");
          if (lsEmError) {
            lsEmError.style.display = "none";
          }
        }
        if (input.dataset.numericMultiListenerAttached) {
          return;
        }
        input.dataset.numericMultiListenerAttached = "true";
        input.addEventListener("input", function() {
          const value = this.value.trim();
          const messagesGroup = inputGroup.querySelector(".fr-messages-group");
          const lsEmError = listItem.querySelector(".ls-em-error");
          if (lsEmError) {
            lsEmError.style.display = "none";
          }
          if (value === "") {
            this.classList.add("fr-input--error");
            this.classList.remove("fr-input--valid");
            inputGroup.classList.add("fr-input-group--error");
            inputGroup.classList.remove("fr-input-group--valid");
            const errorMsg = messagesGroup.querySelector(".fr-message--error");
            if (errorMsg) errorMsg.remove();
            const validMsg = messagesGroup.querySelector(".fr-message--valid");
            if (validMsg) validMsg.remove();
            return;
          }
          const isValidNumber2 = /^-?\d+([.,]\d*)?$/.test(value) || /^-?\d*[.,]\d+$/.test(value);
          if (!isValidNumber2) {
            this.classList.add("fr-input--error");
            this.classList.remove("fr-input--valid");
            inputGroup.classList.add("fr-input-group--error");
            inputGroup.classList.remove("fr-input-group--valid");
            const validMsg = messagesGroup.querySelector(".fr-message--valid");
            if (validMsg) validMsg.remove();
            let errorMsg = messagesGroup.querySelector(".fr-message--error");
            if (!errorMsg) {
              errorMsg = document.createElement("p");
              errorMsg.className = "fr-message fr-message--error";
              errorMsg.setAttribute("role", "alert");
              messagesGroup.appendChild(errorMsg);
            }
            errorMsg.textContent = "Ce champ n'accepte que des chiffres. Les caractères non numériques sont automatiquement supprimés.";
            question.dataset.hadError = "true";
          } else {
            this.classList.remove("fr-input--error");
            inputGroup.classList.remove("fr-input-group--error");
            const errorMsg = messagesGroup.querySelector(".fr-message--error");
            if (errorMsg) {
              errorMsg.remove();
              question.dataset.hadError = "true";
            }
            var hasSumConstraint = !!question.querySelector(".dynamic-total");
            if (!hasSumConstraint && question.dataset.hadError === "true") {
              this.classList.add("fr-input--valid");
              inputGroup.classList.add("fr-input-group--valid");
              let validMsg = messagesGroup.querySelector(".fr-message--valid");
              if (!validMsg) {
                validMsg = document.createElement("p");
                validMsg.className = "fr-message fr-message--valid";
                messagesGroup.appendChild(validMsg);
              }
              validMsg.textContent = "Merci d'avoir répondu";
            }
          }
          setTimeout(function() {
            var allInputs = question.querySelectorAll('input.numeric[data-number="1"]');
            var allFormatValid = true;
            var allFilled = true;
            allInputs.forEach(function(inp) {
              var val = inp.value ? inp.value.trim() : "";
              if (val === "") {
                allFilled = false;
                allFormatValid = false;
              } else {
                var isValid = /^-?\d+([.,]\d*)?$/.test(val) || /^-?\d*[.,]\d+$/.test(val);
                if (!isValid) allFormatValid = false;
              }
            });
            var totalEl = question.querySelector(".dynamic-total");
            var hasSumConstraint2 = false;
            var isSumValid = true;
            if (totalEl) {
              var qId = totalEl.id ? totalEl.id.replace("totalvalue_", "") : null;
              var sumRangeMsg = qId ? document.getElementById("vmsg_" + qId + "_sum_range-dsfr") : null;
              if (sumRangeMsg) {
                hasSumConstraint2 = true;
                var rangeMatch = sumRangeMsg.textContent.match(/(\d+)\s+.+\s+(\d+)/);
                if (rangeMatch) {
                  var minSum = parseFloat(rangeMatch[1]);
                  var maxSum = parseFloat(rangeMatch[2]);
                  var currentSum = 0;
                  allInputs.forEach(function(inp) {
                    var val = inp.value ? inp.value.trim().replace(",", ".") : "";
                    if (val !== "" && !isNaN(parseFloat(val))) {
                      currentSum += parseFloat(val);
                    }
                  });
                  isSumValid = currentSum >= minSum && currentSum <= maxSum;
                }
              }
            }
            if (allFormatValid && allFilled && isSumValid) {
              question.classList.remove("input-error", "fr-input-group--error");
              question.classList.add("input-valid");
              if (question.dataset.hadError === "true") {
                allInputs.forEach(function(inp) {
                  var grp = inp.closest(".fr-input-group");
                  if (grp) {
                    grp.classList.remove("fr-input-group--error");
                    grp.classList.add("fr-input-group--valid");
                    inp.classList.remove("fr-input--error");
                    inp.classList.add("fr-input--valid");
                    var msgs = grp.querySelector(".fr-messages-group");
                    if (msgs) {
                      var vMsg = msgs.querySelector(".fr-message--valid");
                      if (!vMsg) {
                        vMsg = document.createElement("p");
                        vMsg.className = "fr-message fr-message--valid";
                        msgs.appendChild(vMsg);
                      }
                      vMsg.textContent = "Merci d'avoir répondu";
                    }
                  }
                });
              }
              var dsfrErrorMsg = question.querySelector(".question-valid-container .fr-message--error");
              if (dsfrErrorMsg) dsfrErrorMsg.remove();
              if (typeof updateErrorSummary === "function") {
                setTimeout(updateErrorSummary, 50);
              }
            } else if (allFormatValid && hasSumConstraint2 && !isSumValid) {
              question.classList.remove("input-valid");
              question.classList.add("input-error");
              allInputs.forEach(function(inp) {
                var grp = inp.closest(".fr-input-group");
                if (grp) {
                  grp.classList.remove("fr-input-group--error", "fr-input-group--valid");
                  inp.classList.remove("fr-input--error", "fr-input--valid");
                  var msgs = grp.querySelector(".fr-messages-group");
                  if (msgs) {
                    var vMsg = msgs.querySelector(".fr-message--valid");
                    if (vMsg) vMsg.remove();
                    var eMsg = msgs.querySelector(".fr-message--error");
                    if (eMsg) eMsg.remove();
                  }
                }
              });
              question.dataset.hadError = "true";
            } else if (!allFormatValid) {
              question.classList.add("input-error");
              question.classList.remove("input-valid");
            }
          }, 200);
        });
      });
    });
  }
  function observeNumericMultiSumValidation() {
    var numericMultiQuestions = document.querySelectorAll(".question-container.numeric-multi");
    console.log("[DSFR SumValidation] Questions numeric-multi trouvées:", numericMultiQuestions.length);
    numericMultiQuestions.forEach(function(question) {
      var totalEl = question.querySelector(".dynamic-total");
      console.log("[DSFR SumValidation] totalEl:", totalEl ? totalEl.id : "NON TROUVÉ");
      if (!totalEl) return;
      var qId = totalEl.id ? totalEl.id.replace("totalvalue_", "") : null;
      console.log("[DSFR SumValidation] qId:", qId);
      if (!qId) return;
      var sumRangeMsgId = "vmsg_" + qId + "_sum_range-dsfr";
      var sumRangeMsg = document.getElementById(sumRangeMsgId);
      console.log("[DSFR SumValidation] sumRangeMsg (" + sumRangeMsgId + "):", sumRangeMsg ? sumRangeMsg.textContent : "NON TROUVÉ");
      if (!sumRangeMsg) {
        sumRangeMsg = document.getElementById("vmsg_" + qId + "_sum_range");
        console.log("[DSFR SumValidation] fallback vmsg_" + qId + "_sum_range:", sumRangeMsg ? sumRangeMsg.textContent : "NON TROUVÉ");
      }
      if (!sumRangeMsg) return;
      if (totalEl.dataset.dsfrSumObserver) return;
      totalEl.dataset.dsfrSumObserver = "true";
      var rangeMatch = sumRangeMsg.textContent.match(/(\d+)\s+.+\s+(\d+)/);
      console.log("[DSFR SumValidation] rangeMatch:", rangeMatch);
      if (!rangeMatch) return;
      var minSum = parseFloat(rangeMatch[1]);
      var maxSum = parseFloat(rangeMatch[2]);
      var totalRow = totalEl.closest(".ls-group-total");
      function checkSumAndUpdate() {
        var allInputs2 = question.querySelectorAll('input.numeric[data-number="1"]');
        var currentSum = 0;
        var anyFilled = false;
        allInputs2.forEach(function(inp) {
          var val = inp.value ? inp.value.trim().replace(",", ".") : "";
          if (val !== "" && !isNaN(parseFloat(val))) {
            currentSum += parseFloat(val);
            anyFilled = true;
          }
        });
        var isSumError = anyFilled && (currentSum < minSum || currentSum > maxSum);
        if (isSumError) {
          sumRangeMsg.classList.remove("fr-message--info", "fr-message--valid");
          sumRangeMsg.classList.add("fr-message--error");
          sumRangeMsg.setAttribute("role", "alert");
          if (totalRow) {
            var totalErrMsg = totalRow.querySelector(".sum-range-error");
            if (!totalErrMsg) {
              totalErrMsg = document.createElement("p");
              totalErrMsg.className = "fr-message fr-message--error sum-range-error";
              totalErrMsg.setAttribute("role", "alert");
              totalErrMsg.textContent = sumRangeMsg.textContent;
              var totalInputGroup = totalRow.querySelector(".ls-input-group");
              if (totalInputGroup) {
                totalInputGroup.appendChild(totalErrMsg);
              } else {
                totalRow.appendChild(totalErrMsg);
              }
            }
          }
          question.classList.remove("input-valid");
          question.classList.add("input-error");
          allInputs2.forEach(function(inp) {
            var grp = inp.closest(".fr-input-group");
            if (grp) {
              grp.classList.remove("fr-input-group--valid");
              inp.classList.remove("fr-input--valid");
              var msgs = grp.querySelector(".fr-messages-group");
              if (msgs) {
                var vMsg = msgs.querySelector(".fr-message--valid");
                if (vMsg) vMsg.remove();
              }
            }
          });
          question.dataset.hadError = "true";
        } else {
          sumRangeMsg.classList.remove("fr-message--error");
          sumRangeMsg.classList.add("fr-message--info");
          sumRangeMsg.removeAttribute("role");
          if (totalRow) {
            var totalErrMsg = totalRow.querySelector(".sum-range-error");
            if (totalErrMsg) totalErrMsg.remove();
          }
        }
      }
      checkSumAndUpdate();
      var allInputs = question.querySelectorAll('input.numeric[data-number="1"]');
      allInputs.forEach(function(inp) {
        inp.addEventListener("input", function() {
          setTimeout(checkSumAndUpdate, 250);
        });
      });
    });
  }

  // modules/theme-dsfr/src/validation/array-validation.js
  function handleArrayValidation2() {
    var arrayQuestions = document.querySelectorAll('.question-container.input-error[class*="array-"]');
    arrayQuestions.forEach(function(question) {
      if (question.dataset.arrayValidationAttached) {
        return;
      }
      question.dataset.arrayValidationAttached = "true";
      var legacyMessages = question.querySelectorAll(
        ".ls-question-mandatory, .ls-question-mandatory-initial, .ls-question-mandatory-array, .ls-question-mandatory-arraycolumn"
      );
      legacyMessages.forEach(function(msg) {
        msg.style.display = "none";
      });
      var validContainer = question.querySelector(".question-valid-container");
      if (validContainer) {
        validContainer.style.display = "none";
      }
      var allInputs = question.querySelectorAll('table input[type="text"], table textarea, table select');
      allInputs.forEach(function(input) {
        input.classList.remove("fr-input--error", "error");
        var cell = input.closest(".fr-input-group");
        if (cell) {
          cell.classList.remove("fr-input-group--error");
        }
      });
      var errorRows = question.querySelectorAll("tr.ls-mandatory-error");
      errorRows.forEach(function(row) {
        row.classList.remove("ls-mandatory-error");
        var th = row.querySelector("th.fr-text--error");
        if (th) th.classList.remove("fr-text--error");
      });
      var errorCells = question.querySelectorAll("td.has-error");
      errorCells.forEach(function(td) {
        td.classList.remove("has-error");
      });
      var counterContainer = document.createElement("div");
      counterContainer.className = "fr-messages-group fr-mt-2w";
      counterContainer.setAttribute("aria-live", "polite");
      counterContainer.id = "mandatory-counter-" + (question.id || Math.random().toString(36).substring(2, 11));
      var counterMessage = document.createElement("p");
      counterMessage.className = "fr-message fr-message--error";
      counterMessage.setAttribute("role", "status");
      counterContainer.appendChild(counterMessage);
      var tableWrapper = question.querySelector(".fr-table");
      if (tableWrapper) {
        tableWrapper.parentNode.insertBefore(counterContainer, tableWrapper.nextSibling);
      }
      function updateCounter() {
        var totalFields = allInputs.length;
        var emptyCount = 0;
        allInputs.forEach(function(input) {
          var value = input.value ? input.value.trim() : "";
          var inputGroup = input.closest(".fr-input-group");
          if (value === "") {
            emptyCount++;
            input.classList.remove("fr-input--error", "fr-input--valid");
            if (inputGroup) {
              inputGroup.classList.remove("fr-input-group--error", "fr-input-group--valid");
            }
          } else {
            var isNumberOnly = input.dataset.number === "1";
            var isInvalidNumber = isNumberOnly && !isValidNumber(value);
            if (isInvalidNumber) {
              emptyCount++;
              input.classList.add("fr-input--error");
              input.classList.remove("fr-input--valid");
              if (inputGroup) {
                inputGroup.classList.add("fr-input-group--error");
                inputGroup.classList.remove("fr-input-group--valid");
              }
            } else {
              input.classList.remove("fr-input--error");
              input.classList.add("fr-input--valid");
              if (inputGroup) {
                inputGroup.classList.remove("fr-input-group--error");
                inputGroup.classList.add("fr-input-group--valid");
              }
            }
          }
        });
        if (emptyCount === 0) {
          counterContainer.remove();
          question.classList.remove("input-error", "fr-input-group--error");
          question.classList.add("input-valid");
          if (typeof updateErrorSummary === "function") {
            setTimeout(updateErrorSummary, 50);
          }
        } else {
          question.classList.add("input-error");
          question.classList.remove("input-valid");
          if (emptyCount === totalFields) {
            counterMessage.textContent = tMandatory("fields_all_required", null, totalFields);
          } else if (emptyCount === 1) {
            counterMessage.textContent = tMandatory("fields_remaining_singular");
          } else {
            counterMessage.textContent = tMandatory("fields_remaining_plural", emptyCount, totalFields);
          }
          if (typeof updateErrorSummary === "function") {
            setTimeout(updateErrorSummary, 50);
          }
        }
      }
      updateCounter();
      allInputs.forEach(function(input) {
        if (input.dataset.arrayInputListener) return;
        input.dataset.arrayInputListener = "true";
        input.addEventListener("input", updateCounter);
      });
    });
  }
  function handleSimpleQuestionValidation() {
    const simpleQuestions = document.querySelectorAll(".question-container.input-error");
    simpleQuestions.forEach(function(question) {
      if (question.classList.contains("numeric-multi") || question.classList.contains("multiple-short-txt") || question.dataset.simpleValidationAttached || question.classList.toString().match(/array-/)) {
        return;
      }
      question.dataset.simpleValidationAttached = "true";
      const allLsMessages = question.querySelectorAll(".ls-question-mandatory, .ls-question-mandatory-initial, .ls-question-mandatory-other");
      allLsMessages.forEach(function(msg) {
        msg.style.display = "none";
      });
      const radios = question.querySelectorAll('input[type="radio"]');
      const checkboxes = question.querySelectorAll('input[type="checkbox"]');
      const selects = question.querySelectorAll("select");
      const dateInputs = question.querySelectorAll('input[type="date"], input[type="text"].date');
      function markQuestionValid() {
        question.classList.remove("input-error", "fr-input-group--error");
        question.classList.add("input-valid");
        const allErrors = question.querySelectorAll(".ls-question-mandatory, .ls-question-mandatory-initial, .ls-question-mandatory-other");
        allErrors.forEach(function(error) {
          error.style.display = "none";
        });
        const dsfrError = question.querySelector(".fr-message--error");
        if (dsfrError) {
          dsfrError.remove();
        }
        if (typeof updateErrorSummary === "function") {
          setTimeout(updateErrorSummary, 50);
        }
      }
      radios.forEach(function(radio) {
        radio.addEventListener("change", function() {
          if (this.checked) {
            markQuestionValid();
          }
        });
      });
      checkboxes.forEach(function(checkbox) {
        checkbox.addEventListener("change", function() {
          const anyChecked = Array.from(checkboxes).some((cb) => cb.checked);
          if (anyChecked) {
            markQuestionValid();
          }
        });
      });
      selects.forEach(function(select) {
        select.addEventListener("change", function() {
          if (this.value && this.value !== "" && this.value !== "-oth-") {
            markQuestionValid();
          }
        });
      });
      dateInputs.forEach(function(dateInput) {
        dateInput.addEventListener("change", function() {
          if (this.value && this.value.trim() !== "") {
            markQuestionValid();
          }
        });
      });
    });
  }

  // modules/theme-dsfr/src/validation/validation-messages.js
  function transformValidationMessages() {
    const emMessages = document.querySelectorAll(".ls-question-message");
    emMessages.forEach((message) => {
      if (message.classList.contains("fr-message")) {
        return;
      }
      let messageType = "info";
      if (message.classList.contains("ls-em-error")) {
        messageType = "error";
      } else if (message.classList.contains("ls-em-warning")) {
        messageType = "warning";
      } else if (message.classList.contains("ls-em-success") || message.classList.contains("ls-em-tip")) {
        messageType = "info";
      }
      const dsfrMessage = document.createElement("p");
      dsfrMessage.className = `fr-message fr-message--${messageType}`;
      dsfrMessage.textContent = message.textContent.trim();
      dsfrMessage.id = message.id ? `${message.id}-dsfr` : "";
      message.replaceWith(dsfrMessage);
    });
  }

  // modules/theme-dsfr/src/dropdowns/dropdown-array.js
  var styleObserver = null;
  function fixDropdownArrayInlineStyles() {
    if (window.innerWidth >= 768) {
      return;
    }
    const dropdownArrays = document.querySelectorAll("table.dropdown-array");
    dropdownArrays.forEach((table) => {
      const cells = table.querySelectorAll('tbody tr td[style*="display"]');
      cells.forEach((cell) => {
        cell.removeAttribute("style");
      });
    });
  }
  function setupStyleObserver() {
    if (window.innerWidth >= 768) {
      if (styleObserver) {
        styleObserver.disconnect();
        styleObserver = null;
      }
      return;
    }
    if (styleObserver) {
      return;
    }
    styleObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === "attributes" && mutation.attributeName === "style") {
          const target = mutation.target;
          if (target.tagName === "TD" && target.closest("table.dropdown-array")) {
            target.removeAttribute("style");
          }
        }
      });
    });
    const dropdownArrays = document.querySelectorAll("table.dropdown-array");
    dropdownArrays.forEach(function(table) {
      styleObserver.observe(table, {
        attributes: true,
        attributeFilter: ["style"],
        subtree: true
      });
    });
  }

  // modules/theme-dsfr/src/a11y/conditional-aria.js
  function extractQuestionCodes(expression) {
    if (!expression) return [];
    const questionCodes = [];
    const regex = /\b(Q\d+(?:_SQ\d+)?)\./gi;
    let match;
    while ((match = regex.exec(expression)) !== null) {
      const code = match[1];
      if (!questionCodes.includes(code)) {
        questionCodes.push(code);
      }
    }
    return questionCodes;
  }
  function findQuestionByCode(questionCode) {
    let question = document.querySelector(`[data-qcode="${questionCode}"]`);
    if (!question) {
      question = document.querySelector(`[id*="${questionCode}"]`);
    }
    return question;
  }
  function getQuestionText(questionElement) {
    const questionTitle = questionElement.querySelector('[id^="ls-question-text-"]');
    if (questionTitle) {
      const text = questionTitle.textContent.trim();
      return text.length > 50 ? text.substring(0, 50) + "..." : text;
    }
    const questionNumber = questionElement.querySelector(".fr-text--xs");
    if (questionNumber) {
      return questionNumber.textContent.trim();
    }
    return "la question précédente";
  }
  function createConditionalDescription(questionId, parentQuestions) {
    const descId = `conditional-desc-${questionId}`;
    let descElement = document.getElementById(descId);
    if (descElement) {
      return descElement;
    }
    descElement = document.createElement("div");
    descElement.id = descId;
    descElement.className = "fr-sr-only";
    descElement.setAttribute("role", "note");
    let descText;
    const pq = [...parentQuestions];
    if (pq.length === 1) {
      descText = `Cette question dépend de votre réponse à ${pq[0]}.`;
    } else if (pq.length > 1) {
      const lastQuestion = pq.pop();
      descText = `Cette question dépend de vos réponses à ${pq.join(", ")} et ${lastQuestion}.`;
    } else {
      descText = "Cette question est conditionnelle.";
    }
    descElement.textContent = descText;
    return descElement;
  }
  function addAriaDescribedBy(questionElement, descriptionId) {
    const formFields = questionElement.querySelectorAll("input, select, textarea");
    formFields.forEach((field) => {
      const currentDescribedBy = field.getAttribute("aria-describedby") || "";
      if (!currentDescribedBy.includes(descriptionId)) {
        const newDescribedBy = currentDescribedBy ? `${currentDescribedBy} ${descriptionId}`.trim() : descriptionId;
        field.setAttribute("aria-describedby", newDescribedBy);
      }
    });
  }
  function processConditionalQuestion(questionElement) {
    var _a;
    const relevanceExpression = questionElement.getAttribute("data-relevance");
    if (!relevanceExpression) return;
    const questionId = questionElement.id || ((_a = questionElement.querySelector("[id]")) == null ? void 0 : _a.id) || `q-${Date.now()}`;
    const parentQuestionCodes = extractQuestionCodes(relevanceExpression);
    if (parentQuestionCodes.length === 0) return;
    const parentQuestionTexts = [];
    parentQuestionCodes.forEach((code) => {
      const parentElement = findQuestionByCode(code);
      if (parentElement) {
        const questionText = getQuestionText(parentElement);
        parentQuestionTexts.push(questionText);
      }
    });
    if (parentQuestionTexts.length === 0) return;
    const descElement = createConditionalDescription(questionId, parentQuestionTexts);
    questionElement.insertBefore(descElement, questionElement.firstChild);
    addAriaDescribedBy(questionElement, descElement.id);
  }
  function initConditionalQuestionsAria() {
    var conditionalQuestions = document.querySelectorAll(".question-container[data-relevance]");
    var hiddenQuestions = document.querySelectorAll(".question-container.ls-irrelevant, .question-container.ls-hidden");
    hiddenQuestions.forEach(function(q) {
      if (!q.hasAttribute("data-relevance") && !q.dataset.dsfrConditionalProcessed) {
        q.dataset.dsfrConditionalProcessed = "true";
        var questionId = q.id || "q-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
        var descElement = createConditionalDescription(questionId, []);
        q.insertBefore(descElement, q.firstChild);
        addAriaDescribedBy(q, descElement.id);
      }
    });
    conditionalQuestions.forEach(function(questionElement) {
      if (questionElement.dataset.dsfrConditionalProcessed) return;
      questionElement.dataset.dsfrConditionalProcessed = "true";
      try {
        processConditionalQuestion(questionElement);
      } catch (error) {
      }
    });
  }
  function setupConditionalQuestionsObserver() {
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          var targets = [];
          if (node.classList && node.classList.contains("question-container")) {
            targets.push(node);
          }
          var nested = node.querySelectorAll && node.querySelectorAll(".question-container");
          if (nested) {
            nested.forEach(function(n) {
              targets.push(n);
            });
          }
          targets.forEach(function(q) {
            if (q.dataset.dsfrConditionalProcessed) return;
            if (q.hasAttribute("data-relevance") || q.classList.contains("ls-irrelevant") || q.classList.contains("ls-hidden")) {
              q.dataset.dsfrConditionalProcessed = "true";
              if (q.hasAttribute("data-relevance")) {
                try {
                  processConditionalQuestion(q);
                } catch (e) {
                }
              } else {
                var qId = q.id || "q-" + Date.now();
                var desc = createConditionalDescription(qId, []);
                q.insertBefore(desc, q.firstChild);
                addAriaDescribedBy(q, desc.id);
              }
            }
          });
        });
      });
    });
    var surveyContainer = document.getElementById("limesurvey") || document.body;
    observer.observe(surveyContainer, {
      childList: true,
      subtree: true
    });
  }
  function initConditionalVisibilityNotifier() {
    var liveRegion = document.getElementById("conditional-live-region");
    if (!liveRegion) {
      liveRegion = document.createElement("div");
      liveRegion.id = "conditional-live-region";
      liveRegion.className = "fr-sr-only";
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.setAttribute("aria-atomic", "true");
      document.body.appendChild(liveRegion);
    }
    function getQuestionLabel(questionEl) {
      var titleEl = questionEl.querySelector('[id^="ls-question-text-"]');
      if (titleEl) {
        var text = titleEl.textContent.trim();
        return text.length > 80 ? text.substring(0, 80) + "…" : text;
      }
      return "Une question";
    }
    var announceTimer = null;
    var pendingAnnouncements = [];
    function scheduleAnnouncement(message) {
      pendingAnnouncements.push(message);
      if (announceTimer) clearTimeout(announceTimer);
      announceTimer = setTimeout(function() {
        liveRegion.textContent = pendingAnnouncements.join(". ");
        pendingAnnouncements = [];
        setTimeout(function() {
          liveRegion.textContent = "";
        }, 3e3);
      }, 300);
    }
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        var el = mutation.target;
        if (!el.classList || !el.classList.contains("question-container")) return;
        if (mutation.type === "attributes") {
          var isHidden = isQuestionHidden(el);
          var wasHidden = el.dataset.conditionalWasHidden === "true";
          if (isHidden && !wasHidden) {
            el.dataset.conditionalWasHidden = "true";
          } else if (!isHidden && wasHidden) {
            el.dataset.conditionalWasHidden = "false";
            var label = getQuestionLabel(el);
            scheduleAnnouncement("Nouvelle question affichée : " + label);
          }
        }
      });
    });
    var allQuestions = document.querySelectorAll(".question-container");
    allQuestions.forEach(function(q) {
      q.dataset.conditionalWasHidden = isQuestionHidden(q) ? "true" : "false";
      observer.observe(q, {
        attributes: true,
        attributeFilter: ["style", "class"]
      });
    });
  }
  function excludeIrrelevantInputsFromTabOrder() {
    var irrelevant = document.querySelectorAll(".question-container.ls-irrelevant, .question-container.ls-hidden");
    irrelevant.forEach(function(q) {
      q.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(function(field) {
        field.setAttribute("tabindex", "-1");
      });
    });
  }

  // modules/theme-dsfr/src/inputs/input-on-demand.js
  function reinitInputOnDemand() {
    const addButtons = document.querySelectorAll(".selector--inputondemand-addlinebutton");
    addButtons.forEach((button) => {
      if (button.dataset.initialized) return;
      button.dataset.initialized = "true";
      const container = button.closest('[id^="selector--inputondemand-"]');
      if (!container) return;
      const itemsList = container.querySelector(".selector--inputondemand-list");
      if (!itemsList) return;
      button.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const hiddenItems = itemsList.querySelectorAll(".selector--inputondemand-list-item.d-none");
        if (hiddenItems.length > 0) {
          const nextItem = hiddenItems[0];
          nextItem.classList.remove("d-none");
          const input = nextItem.querySelector("input, textarea");
          if (input) setTimeout(() => input.focus(), 100);
          if (hiddenItems.length === 1) button.style.display = "none";
        }
      }, true);
    });
  }
  function restoreVisibleLines() {
    const containers = document.querySelectorAll('[id^="selector--inputondemand-"]');
    containers.forEach((container) => {
      const itemsList = container.querySelector(".selector--inputondemand-list");
      if (!itemsList) return;
      const allItems = itemsList.querySelectorAll(".selector--inputondemand-list-item");
      const hiddenItems = itemsList.querySelectorAll(".selector--inputondemand-list-item.d-none");
      if (hiddenItems.length === allItems.length && allItems.length > 0) {
        allItems[0].classList.remove("d-none");
      }
    });
  }
  function updateAddButtonVisibility() {
    const containers = document.querySelectorAll('[id^="selector--inputondemand-"]');
    containers.forEach((container) => {
      const button = container.querySelector(".selector--inputondemand-addlinebutton");
      const itemsList = container.querySelector(".selector--inputondemand-list");
      if (!button || !itemsList) return;
      const hiddenItems = itemsList.querySelectorAll(".selector--inputondemand-list-item.d-none");
      button.style.display = hiddenItems.length > 0 ? "" : "none";
    });
  }
  function initMultipleShortText() {
    restoreVisibleLines();
    reinitInputOnDemand();
    updateAddButtonVisibility();
  }

  // modules/theme-dsfr/src/inputs/radio-buttons.js
  function initBootstrapButtonsRadio() {
    const radioGroups = document.querySelectorAll('.radio-list[data-bs-toggle="buttons"]');
    radioGroups.forEach(function(group) {
      const radios = group.querySelectorAll('input[type="radio"]');
      radios.forEach(function(radio) {
        radio.addEventListener("change", function() {
          if (this.checked) {
            const allContainers = group.querySelectorAll(".bootstrap-buttons-div .form-check");
            allContainers.forEach(function(container) {
              container.classList.remove("active");
            });
            const currentContainer = this.closest(".form-check");
            if (currentContainer) {
              currentContainer.classList.add("active");
            }
          }
        });
        if (radio.checked) {
          const container = radio.closest(".form-check");
          if (container) {
            container.classList.add("active");
          }
        }
      });
    });
  }
  function initRadioOtherField() {
    const otherRadios = document.querySelectorAll('input[type="radio"][value="-oth-"]');
    otherRadios.forEach(function(radio) {
      const name = radio.name;
      const otherDiv = document.getElementById("div" + name + "other");
      const otherInput = document.getElementById("answer" + name + "othertext");
      const hiddenInput = document.getElementById("answer" + name + "othertextaux");
      if (!otherDiv || !otherInput) return;
      if (radio.checked) {
        otherDiv.classList.remove("ls-js-hidden");
        if (hiddenInput && hiddenInput.value) {
          otherInput.value = hiddenInput.value;
        }
      }
    });
  }

  // modules/theme-dsfr/src/captcha/captcha.js
  function initCaptchaReload() {
    const reloadButton = document.getElementById("reloadCaptcha");
    if (!reloadButton) {
      return;
    }
    if (reloadButton.dataset.captchaInitialized) {
      return;
    }
    reloadButton.dataset.captchaInitialized = "true";
    reloadButton.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const captchaContainer = reloadButton.closest('.fr-captcha, .captcha-container, [class*="captcha"]');
      let captchaImage = null;
      if (captchaContainer) {
        captchaImage = captchaContainer.querySelector("img");
      }
      if (!captchaImage) {
        const form = reloadButton.closest("form");
        if (form) {
          captchaImage = form.querySelector('img[src*="captcha"]');
        }
      }
      if (!captchaImage) {
        window.location.reload();
        return;
      }
      const currentSrc = captchaImage.src;
      const newSrc = currentSrc.replace(/v=[^&]*/, "v=" + (/* @__PURE__ */ new Date()).getTime());
      captchaImage.style.opacity = "0.5";
      captchaImage.onload = function() {
        captchaImage.style.opacity = "1";
        if (typeof window.__lsDsfrFixCaptchaAlt === "function") {
          window.__lsDsfrFixCaptchaAlt();
        }
      };
      captchaImage.onerror = function() {
        captchaImage.style.opacity = "1";
      };
      captchaImage.src = newSrc;
    });
  }
  function initCaptchaValidation() {
    const captchaForm = document.getElementById("form-captcha");
    const captchaInput = document.getElementById("loadsecurity");
    const messagesGroup = document.getElementById("loadsecurity-messages");
    const inputGroup = captchaInput == null ? void 0 : captchaInput.closest(".fr-input-group");
    if (!captchaForm || !captchaInput || !messagesGroup) {
      return;
    }
    captchaForm.addEventListener("submit", function(e) {
      inputGroup.classList.remove("fr-input-group--error");
      messagesGroup.innerHTML = "";
      if (!captchaInput.value || captchaInput.value.trim() === "") {
        e.preventDefault();
        e.stopPropagation();
        inputGroup.classList.add("fr-input-group--error");
        const errorMessage = document.createElement("p");
        errorMessage.className = "fr-message fr-message--error";
        errorMessage.textContent = "Veuillez saisir votre réponse";
        messagesGroup.appendChild(errorMessage);
        captchaInput.focus();
        return false;
      }
    });
  }

  // modules/theme-dsfr/src/index.js
  window.DSFRSanitizeRTEContent = sanitizeRTEContent;
  window.updateErrorSummary = updateErrorSummary;
  onReady(() => {
    sanitizeRTEContent();
    enableImageLazyLoading();
    extendDescribedByForValidationTips();
    addInputmodeNumericToNumericFields();
    reorderListRadioNoAnswer();
    fixTableAccessibility();
    handleRequiredFields();
    transformErrorsToDsfr();
    handleMultipleShortTextErrors();
    observeErrorChanges();
    initAriaInvalidSync();
    initErrorSummaryObserver();
    initNumericValidation();
    handleArrayValidation2();
    handleNumericMultiValidation();
    handleSimpleQuestionValidation();
    transformValidationMessages();
    setTimeout(transformValidationMessages, 100);
    setTimeout(observeNumericMultiSumValidation, 200);
    setTimeout(createErrorSummary, 100);
    fixDropdownArrayInlineStyles();
    setupStyleObserver();
    initConditionalQuestionsAria();
    setupConditionalQuestionsObserver();
    initConditionalVisibilityNotifier();
    excludeIrrelevantInputsFromTabOrder();
    initMultipleShortText();
    initBootstrapButtonsRadio();
    initRadioOtherField();
    initCaptchaReload();
    initCaptchaValidation();
    const forms = document.querySelectorAll('form#limesurvey, form[name="limesurvey"]');
    forms.forEach((form) => {
      form.addEventListener("submit", () => {
        setTimeout(() => {
          transformErrorsToDsfr();
          createErrorSummary();
        }, 500);
      });
    });
  });
  onQuestionsLoaded(() => {
    enableImageLazyLoading();
    extendDescribedByForValidationTips();
    addInputmodeNumericToNumericFields();
    reorderListRadioNoAnswer();
    handleRequiredFields();
    transformErrorsToDsfr();
    handleMultipleShortTextErrors();
    initNumericValidation();
    handleArrayValidation2();
    handleNumericMultiValidation();
    handleSimpleQuestionValidation();
    transformValidationMessages();
    fixDropdownArrayInlineStyles();
    setupStyleObserver();
    setTimeout(fixTableAccessibility, 200);
    setTimeout(observeNumericMultiSumValidation, 200);
    setTimeout(createErrorSummary, 100);
    initMultipleShortText();
    initBootstrapButtonsRadio();
    initRadioOtherField();
    initCaptchaReload();
    initCaptchaValidation();
  });
  onPjax(() => {
    setTimeout(sanitizeRTEContent, 100);
  });
  var dropdownResizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(dropdownResizeTimer);
    dropdownResizeTimer = setTimeout(() => {
      fixDropdownArrayInlineStyles();
      setupStyleObserver();
    }, 250);
  });
})();
