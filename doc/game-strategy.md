## Game strategy

Mark all bombs and reveal all non-bomb cells!

<details> 
<summary>Mark bombs (spoilers)</summary>
For a cell whose value is equal to the number of non-revelealed neighbour cells, all of its neighbours can be marked as bombs.

E.g.
In the following
![flag-1](https://github.com/ThibaultGerrier/minesweeper-solver/blob/master/docs/imgs/flag-1.png?raw=true)
The highlighted cell 1 has only 1 neighbour that is "open", thus it must be a bomb

In the following
![flag-3](https://github.com/ThibaultGerrier/minesweeper-solver/blob/master/docs/imgs/flag-3.png?raw=true)
The highlighted cell 3 has 3 neighbour that are "open", thus all of them must be bombs
</details>


<details> 
<summary>Reveal cells (spoilers)</summary>
For a cell whose value is equal to the number of marked (bomb) neighbour cells, all of its open neighbours can be revealed as non-bombs.

E.g.
In the following
![reveal-1](https://github.com/ThibaultGerrier/minesweeper-solver/blob/master/docs/imgs/reveal-1.png?raw=true)
The highlighted cell 1 has already 1 marked (bomb) neighbour, thus all of its open neighbours can't be bombs and can thus be revealed.

In the following
![reveal-2](https://github.com/ThibaultGerrier/minesweeper-solver/blob/master/docs/imgs/reveal-2.png?raw=true)
The highlighted cell 2 has already 2 marked (bomb) neighbours, thus all of its open neighbours can't be bombs and can thus be revealed.
</details>
