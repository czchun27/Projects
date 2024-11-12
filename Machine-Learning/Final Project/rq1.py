'''
Coby Chun
CSE 163 AF

Final Project: Competitive Pokemon Visualizations
Research Question 1: How much more powerful have new pokémon
become over time and does this indicate power creep?

We answer this question by plotting average base stats of new
pokemon from generation to generation. This plot, saved as
avg_stats_by_gen.png, shows a general increase in stats, both
when we consider only new, original pokemon, and when we include
new forms, such as mega evolutions and regional forms. This shows
that on average, pokemon are getting more powerful from generation
to generation.
'''
import pandas as pd
import matplotlib.pyplot as plt


class Rq1:
    def __init__(self, path: str) -> None:
        '''
        Reads the given path into a pandas dataframe
        '''
        self._full_dex: pd.DataFrame = pd.read_csv(path)
        self._full_dex = self._dex_by_gens(self._full_dex)

    def _assign_gen(self, dex_num: int) -> int:
        '''
        Given a pokedex number, returns the generation of that pokemon
        '''
        if dex_num <= 151:
            return 1
        elif dex_num <= 251:
            return 2
        elif dex_num <= 386:
            return 3
        elif dex_num <= 493:
            return 4
        elif dex_num <= 649:
            return 5
        elif dex_num <= 721:
            return 6
        elif dex_num <= 809:
            return 7
        elif dex_num <= 905:
            return 8
        else:
            return 9

    def _dex_by_gens(self, full_dex: pd.DataFrame) -> pd.DataFrame:
        '''
        Takes a given pokedex, creates a copy, and adds a column corresponding
        to the generation of the pokemon. Returns the copy
        '''
        with_gen = full_dex
        with_gen['gen'] = with_gen['#'].apply(self._assign_gen)
        return with_gen

    def plot_avg_stats_by_gen(self) -> None:
        '''
        Creates a plot of the average base stats over time given a
        pokedex with a column associated with the generation of each pokemon.
        In the plot, blue data includes alternate forms, such as regional
        forms and mega evolutions. The orange data excludes those forms,
        meaning it represents only truly new pokemon
        not based on older generations.
        Plot is saved as avg__stats_by_gen.png
        '''
        figure, ax = plt.subplots(1)
        with_gen = self._full_dex
        by_gen = with_gen.groupby('gen')['Total'].mean()
        by_gen.plot(x='gen', y='Total', ax=ax)

        no_forms = with_gen[with_gen['Variant'].isnull()]
        no_forms = no_forms.groupby('gen')['Total'].mean()
        no_forms.plot(x='gen', y='Total', ax=ax)

        no_legends = with_gen[with_gen['Total'] < 570]
        no_legends = no_legends.groupby('gen')['Total'].mean()
        no_legends.plot(x='gen', y='Total', ax=ax)

        plt.title('Avg Base Stats of New Pokemon by Generation')
        plt.xlabel('Generation')
        plt.ylabel('Average Base Stats')
        plt.legend(['Forms Included', 'Forms Excluded', 'Legends Excluded'])
        plt.savefig('avg_stats_by_gen.png')
