/**
 *Name: Christopher Roy
 *Date: 4/20/2020
 *Section AK: Austin Jenchi
 *
 * This program is a prototype battle system that contains a modifiable
 * attack button, defense button, flee button, and item button. The system also
 * contains an easily modifiable enemy template that can be inserted and taken out extremely easily.
 */

"use strict";
(function() {
  window.addEventListener("load", init);

  let potionNum = 3;
  let braveryNum = 3;
  let eFearState = false;
  let gameOver = false;
  let invOpen = false;
  const CHANGE_TO_STATS = 50;
  const MAX_STAT = 100;
  const MAX_RAND_ONE = 20;
  const DEFENSE_MODIFIER = 4;
  const MAX_RAND_TWO = 5;

  /**
   * This function inilizes all of the following methods and listeners
   * so that they activate after the DOM has been constructed, not before.
   * This prevents attempted calls to DOM elements that do not exist
   * yet. It also holds most of the EventListeners in the program.
   */
  function init() {
    id("hit").addEventListener("click", attck);
    id("defend").addEventListener("click", def);
    id("run").addEventListener("click", charRun);
    id("item").addEventListener("click", use);
  }

  /**
   * This function opens up an inventory menu in the div
   * id'ed as "log" after the item button is pushed.
   * This inventory includes two buttons (potion and
   * Elixir of Bravery) which, if pressed, will activate the
   * either the function usePotion or useBravery.
   * If the item buttom is pushed again, the menu closes.
   * The function invOpen is set to true.
   */
  function use() {
    invOpen = true;
    id("actions").classList.add("hidden");
    let choice = id("log").contains(id("potion"));
    if (!choice) {
      createItem("bravery");
      createItem("potion");
    } else {
      let hidArg = document.getElementsByClassName("items");
      for (let i = 0; i < hidArg.length; i++) {
        hidArg[i].classList.remove("hidden");
      }
    }
    id("item").removeEventListener("click", use);
    id("item").addEventListener("click", exit);
  }

  /**
   * This function takes an item id and uses that to either construct
   * a bravery potion or a health potion (a button) which is then put into
   * the id log.
   * @param {String} itemId - States what type of item is being made.
   */
  function createItem(itemId) {

    if (braveryNum !== 1) {
      let item = document.createElement("button");
      item.id = itemId;
      item.classList.add("items");
      id("log").appendChild(item);
      if (itemId === "bravery") {
        item.textContent = "Elixir of Bravery (" + braveryNum + ")";
        id("bravery").addEventListener("click", useBravery);
      } else {
        item.textContent = "Health Potion(" + potionNum + ")";
        id("potion").addEventListener("click", usePotion);
      }
    } else {
      let item = document.createElement("button");
      item.textContent = "Empty Slot";
      id("log").appendChild(item);
    }
  }

  /**
   * This function exits the inventory if it is opened. This is activated either when an
   * action is taken while the inventory is open or if you click the item button again.
   * The global variable invOpen is set to false.
   */
  function exit() {
    id("item").addEventListener("click", use);
    id("item").removeEventListener("click", this);
    id("actions").classList.remove("hidden");
    let hidArg = document.getElementsByClassName("items");
    for (let i = 0; i < hidArg.length; i++) {
      hidArg[i].classList.add("hidden");
    }
    invOpen = false;
  }

  /**
   * This function, after finding out who is being attacked and the damage done,
   * will subtract health from a target and add an appropriate amount of fear
   * (either damage * .5 or damage * 2). If health reaches 0, the attacker
   * wins the game.
   * @param {Integer} health - The overall health of a specified target.
   * @param {String} action - The specified person making the attack.
   * @param {Interger} damage - The overall damage being inclicted on target.
   * @param {String} target - The specified person being attacked.
   */
  function charattk(health, action, damage, target) {

    if (invOpen) {
      exit();
    }

    if (damage > 0) {
      let newHealth = health - damage;
      if (newHealth <= 0) {
        id(target).textContent = 0;
        id("log").innerHTML = "";
        if (target === "e-health") {
          gameState("YOU HAVE WON!");
        } else {
          gameState("YOU DIED! BETTER LUCK NEXT TIME!");
        }
      } else {
        id(target).textContent = newHealth;
        if (target === "e-health") {
          id(action).textContent = "You attacked (Dmg: " + damage + ")";
        } else {
          id(action).textContent = "Enemy attacked (Dmg: " + damage + ")";
        }
      }
    } else if (target === "e-health") {
      id(action).textContent = "You missed.";
    } else {
      id(action).textContent = "Your foe missed.";
    }
  }

  /**
   * This function subtracts fear from a targets fear meter based on
   * damage that was initially done to the targets health.
   * If fear reaches 100, the player or monster (in this case eFearState is
   * set too true.) will automatically try to run away until they either escape or die.
   * @param {String} fearid - The specified target fear meter.
   * @param {Integer} damage - The overall damage that was inflicted on target.
   */
  function charfear(fearid, damage) {

    if (!gameOver) {
      let fear = 0;
      if (Math.floor(Math.random() * 2) === 1) {
        fear = 1 + damage * 2;
      } else {
        fear = 1 + damage * (1 / 2);
      }
      let truefear = parseInt(id("" + fearid).textContent);
      let newfear = truefear + fear;
      if (newfear > truefear) {
        if (newfear > MAX_STAT) {
          id(fearid).textContent = MAX_STAT;
          if (fearid === "e-fear") {
            id("e-action").textContent = "YOUR ENEMY TRIES TO RUN AWAY";
            eFearState = true;
          } else {
            id("g-action").textContent = "YOU TRY TO RUN AWAY";
            while (!gameOver) {
              charRun();
            }
          }
        } else {
          id(fearid).textContent = newfear;
        }
      }
    }
  }

  /**
   * This function is specific for when an enemy attacks. In this case, an enemy calculates
   * damage based on enemy dfense and and the creatures current attack, and then deals
   * both physical damage and fear damage to the player.
   * @param {Boolean} defenseState - A boolean that states whether the player is defending or not.
   */
  function eHit(defenseState) {
    if (!eFearState && !gameOver) {
      let defense = parseInt(id("defense").textContent);
      let health = parseInt(id("health").textContent);
      let eAttack = parseInt(id("e-attack").textContent);
      let randnum = Math.floor(Math.random() * MAX_RAND_ONE);
      let damage = 0;

      if (defenseState) {
        damage = ((eAttack / 2) + randnum - (defense / 2)) * (1 / DEFENSE_MODIFIER);
      } else {
        damage = (eAttack / 2) + randnum - (defense / 2);
      }
      charattk(health, "e-action", damage, "health");
      charfear("fear", damage);
    } else {
      eRun(false);
    }
  }

  /**
   * This function is simply a parent function that contains both a player attack
   * and an enemy attack with appropriate fear calculations for each. The function
   * activates when the attack button is pressed.
   */
  function attck() {
    let eDefense = parseInt(id("e-defense").textContent);
    let eHealth = parseInt(id("e-health").textContent);
    let attack = parseInt(id("attack").textContent);
    let randnum = Math.floor(Math.random() * MAX_RAND_ONE);
    let damage = (attack / 2) + randnum - (eDefense / 2);

    charattk(eHealth, "g-action", damage, "e-health");
    charfear("e-fear", damage);
    eHit(false);
  }

  /**
   * This function is for when the player chooses to try and escape of
   * their own accord by pressing the run button.
   * If they succeed a 1 in 5 dice roll, they successfully
   * escape and the game ends. Enemy attacks in response to attempted escape.
   */
  function charRun() {
    if (invOpen) {
      exit();
    }
    let randnum = Math.floor(Math.random() * MAX_RAND_TWO);
    if (!gameOver) {
      if (randnum === 1) {
        gameState("YOU ESCAPED WITH YOUR LIFE!");
        gameOver = true;
      } else {
        id("g-action").textContent = "You tried to flee but failed.";
      }
      eHit(false);
    }
  }

  /**
   * This function is called when the "Elixir of Bravery" button is pushed
   * when the inventory is opened. This elixir will remove 50 fear from the player
   * after it is used, but will decrease overall number of elixirs (in this case 3)
   * which can longer be used after they are used up. braveryNum decreases by an increment
   * of one after this is called if it is not 0.
   */
  function useBravery() {
    if (id("bravery").textContent !== "Empty Slot") {
      let newFear = parseInt(id("fear").textContent) - CHANGE_TO_STATS;
      if (newFear < 0) {
        id("fear").textContent = 0;
      } else {
        id("fear").textContent = "" + newFear;
      }
      if (braveryNum <= 1) {
        id("bravery").textContent = "Empty Slot";
      } else {
        braveryNum--;
        id("bravery").textContent = "Elixir of Bravery (" + braveryNum + ")";
      }
    }
  }

  /**
   * This function is called when the "Potion" button is pressed in the inventory.
   * The function heals the user by 50 hit points but can only be used a set number
   * of times (in this case 3). potionNum is decreased by increments of one everytime
   * this is called if it is not 0.
   */
  function usePotion() {
    if (id("potion").textContent !== "Empty Slot") {
      let newHealth = parseInt(id("health").textContent) + CHANGE_TO_STATS;
      if (newHealth > MAX_STAT) {
        id("health").textContent = MAX_STAT;
      } else {
        id("health").textContent = "" + newHealth;
      }
      if (potionNum <= 1) {
        id("potion").textContent = "Empty Slot";
      } else {
        potionNum--;
        id("potion").textContent = "Potion (" + potionNum + ")";
      }
    }
  }

  /**
   * This function is called when a game end condition is met and removes all html in main,
   * replacing it with text fitting the way the game ended. The module-global variable gameOver
   * is set too true.
   * @param {String} endText - This indicates what text will be displayed after the game is over.
   */
  function gameState(endText) {
    document.querySelector("main").innerHTML = "";
    let end = document.createElement("strong");
    end.textContent = endText;
    end.id = "victory";
    document.querySelector("main").appendChild(end);
    gameOver = true;
  }

  /**
   *This function is called when the defend button is pressed.
   *Defending, only available to the player, reduces all incoming damage by 75%.
   */
  function def() {
    if (!invOpen) {
      exit();
    }
    eHit(true);
    if (!gameOver) {
      id("g-action").textContent = "You Defended.";
    }
  }

  /**
   *This function occurs when the enemies fear is 100 and reuslts in the enemy trying to flee
   *the battle every single turn until the enemy either dies or escapes.
   */
  function eRun() {
    let randnum = Math.floor(Math.random() * MAX_RAND_TWO);
    if (randnum === 1) {
      gameState("YOUR ENEMY ESCAPED!");
    }
  }

  /**
   * This function accepts an id name and gets said elemeny from the html page index.html.
   * @param {String} idName - A name of an elements id in index.html.
   * @return {Element} - Returns an element with a specific ID.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

})();