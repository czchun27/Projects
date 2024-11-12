'''
Coby Chun
CSE 163 AF

Final Project: Competitive Pokemon Visualizations
Research Question 2: What are the defining attributes of powerful pokémon?

For this question we narrow our scope to Pokemon available in Generation 7
and look at smogon.com usage data from competitive Pokemon to determine the
true power of a pokemon. We will look at usage data for the Generation 7
Ubers tier, which allows the use of any pokemon. To answer the question,
we will analyze how typing, base stats, and access to good moves relates to
usage in this tier. A good move will be defined as an offensive move that
matches the pokemon's highest offensive stat (spatk, atk) or any status move.
'''
import pandas as pd
import matplotlib.pyplot as plt


class Rq2:
    def __init__(self, path_moves, path_movesets,
                 path_pokemon, path_comp) -> None:
        '''
        Takes in paths to csvs for pokemon moves, pokemon movesets,
        pokemon data, and competitive data. Processes datasets into
        a more useful merged dataset including the movesets, pokemon
        stats and competitive data for each pokemon with both
        competitive data and pokemon stats.
        '''
        self._moves: pd.DataFrame = pd.read_csv(path_moves)
        movesets = pd.read_csv(path_movesets)
        pokemon = pd.read_csv(path_pokemon)
        comp_data = pd.read_csv(path_comp)

        self._reformat_datasets(movesets, pokemon, comp_data)

        merged = pokemon.merge(movesets, left_on='forme',
                               right_on='forme', how='inner')
        self._merged_data: pd.DataFrame = merged.merge(comp_data,
                                                       left_on='forme',
                                                       right_on='Pokemon',
                                                       how='inner')
        self._merged_data = self._merged_data.sort_values('id')
        self._reindex()
        self._add_data_cols()

    def get_merged_data(self) -> pd.DataFrame:
        '''
        Returns the merged dataframe
        '''
        return self._merged_data

    def _reindex(self) -> None:
        '''
        Re-sorts the id column of the merged dataframe
        '''
        for i in range(len(self._merged_data['id'])):
            self._merged_data.loc[i, 'id'] = i

    def _reformat_datasets(self, movesets: pd.DataFrame, pokemon: pd.DataFrame,
                           comp_data: pd.DataFrame) -> None:
        '''
        Reformats the naming conventions of certain columns in the
        given datasets to make them easier to merge
        '''
        self._reformat_name_forme(movesets, ' ', 'forme')
        self._reformat_name_forme(pokemon, ' ', 'forme')
        self._reformat_name_forme(comp_data, '-', 'Pokemon')
        self._reformat_move_names(movesets)
        self._reformat_usage_percent(comp_data)

    def _reformat_move_names(self, movesets: pd.DataFrame) -> None:
        '''
        Reformats the naming conventions of names in movesets to match
        their names in the moves dataset
        '''
        for i in range(1, 175):
            move = 'move' + str(i)
            for i in range(len(movesets[move])):
                entry = movesets.loc[i, move]
                if entry == entry:
                    movesets.loc[i, move] = entry.split('-')[1][1:]

    def _reformat_usage_percent(self, comp_data: pd.DataFrame) -> None:
        '''
        Reformats the Usage % column to be a float (50.0) rather than a
        string (50.0%)
        '''
        usage = comp_data['Usage %']
        for i in range(len(usage)):
            comp_data.loc[i, 'Usage %'] = float(usage[i][0:-1])
        comp_data = comp_data[comp_data['Usage %'] > 0]

    def _reformat_name_forme(self, df: pd.DataFrame,
                             delim: str, col: str) -> None:
        '''
        Used to reformat a given column of a given dataframe by
        checking for a given delimiter, and then if the delimiter is
        found, splits the entry by the delimiter, preserving only
        the first half
        '''
        for i in range(len(df)):
            name = df.loc[i, col]
            form_detected = name.find(delim)
            if form_detected >= 0:
                df.loc[i, col] = name[0:form_detected] + ' '

    def _is_atker(self, id: int) -> int:
        '''
        Checks if the pokemon corresponding to the given
        id is considered an attacker (attack stat > spattack stat).
        Returns 1 if True, 0 if False
        '''
        pokemon = self._merged_data.loc[id, :]
        if pokemon['attack'] > pokemon['spattack']:
            return 1
        else:
            return 0

    def _is_good_move(self, move: str, category: int) -> bool:
        '''
        Checks if a given move is a good move based on the pokemon's
        given category (Attacker or Spattacker).
        A good move matches the pokemon's highest offensive stat or
        is a status move.
        '''
        move_cat = self._moves[self._moves['move'] == move]['category']
        move_cat = list(move_cat)[0]
        if ((move_cat != 'Physical') & (category == 0)):
            return True
        elif (move_cat != 'Special') & (category == 1):
            return True
        else:
            return False

    def _percent_good_moves(self, id: int) -> float:
        '''
        Calculates the percentage of a pokemon's moves that are
        considered good moves. Returns that percentage (100% is 100.0)
        '''
        count_good = 0
        count = 0
        category = self._merged_data.loc[id, 'is_atker']
        moveset = self._merged_data.loc[id, 'move1':'move174'].dropna()
        for move in moveset:
            count += 1
            if move in list(self._moves['move']):
                if self._is_good_move(move, category):
                    count_good += 1
        return count_good / count * 100

    def _add_data_cols(self) -> None:
        '''
        Adds the is_atker and percent columns to the merged dataset.
        '''
        is_atker = self._merged_data['id'].apply(self._is_atker)
        self._merged_data['is_atker'] = is_atker
        percent = self._merged_data['id'].apply(self._percent_good_moves)
        self._merged_data['percent_good_moves'] = percent

    def plot_move_percent(self) -> None:
        '''
        Plots Usage % by percentage of good moves using the merged dataset.
        Red data points are Pokemon who rank within the top 100 usage %
        in the tier. Plot is saved as comp_moveset.png
        '''
        figure, ax = plt.subplots(1)
        merged = self._merged_data
        merged.plot(x='percent_good_moves', y='Usage %',
                    kind='scatter', ax=ax)
        top100 = merged[merged['Rank'] <= 100]
        top100.plot(color='r', x='percent_good_moves', y='Usage %',
                    kind='scatter', ax=ax, legend=True)
        plt.xlabel('Percentage of Good Moves Available')
        plt.ylabel('Usage Percentage (Generation 7 Ubers)')
        plt.title('Usage Percentage by Access to Good Moves')
        plt.legend(['Pokemon Used in Gen 7 Ubers', 'Top 100 Most Used'])
        plt.savefig('comp_moveset.png')

    def plot_by_stats(self) -> None:
        '''
        Plots Usage % by base stats of a pokemon using the merged dataset.
        Red data points are Pokemon who rank within the top 100 usage %
        in the tier. Plot is saved as comp_stats.png
        '''
        figure, ax = plt.subplots(1)
        merged = self._merged_data
        merged.plot(x='total', y='Usage %',
                    kind='scatter', ax=ax)
        top100 = merged[merged['Rank'] <= 100]
        top100.plot(color='r', x='total', y='Usage %',
                    kind='scatter', ax=ax, legend=True)
        plt.xlabel('Base Stats')
        plt.ylabel('Usage Percentage (Generation 7 Ubers)')
        plt.title('Usage Percentage by Base Stats')
        plt.legend(['Pokemon Used in Gen 7 Ubers', 'Top 100 Most Used'])
        plt.savefig('comp_stats.png')

    def plot_by_type(self) -> None:
        '''
        Plots Average Usage % for each pokemon typing using the merged dataset.
        Plot is saved as comp_types.png
        '''
        figure, ax = plt.subplots(1, figsize=(8, 8))
        merged = self._merged_data
        type1 = merged[['type1', 'Usage %']]
        type2 = merged[['type2', 'Usage %']]
        type2 = type2.rename(columns={'type2': 'type1'})
        type = pd.concat([type1, type2])
        type = type.groupby('type1')['Usage %'].mean()
        type.plot(x='type1', y='Usage %', kind='bar', ax=ax)
        plt.xticks(rotation=-40)
        plt.xlabel('Types')
        plt.ylabel('Average Usage Percentage (Generation 7 Ubers)')
        plt.title('Average Usage Percentage by Type')
        plt.savefig('comp_types.png')
