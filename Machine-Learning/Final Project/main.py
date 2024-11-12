'''
Coby Chun
CSE 163 AF

Final Project: Competitive Pokemon Visualizations
'''
from rq1 import Rq1
from rq2 import Rq2
from rq3 import Rq3
# import tester as test # Uncomment to run tests

# My Home Directory
HOME = 'C:/Users/cando/Desktop/School/UW CSE163'
CSV_FULL_DEX = HOME + '/Final Project/data/Pokedex_Cleaned.csv'
CSV_MOVES = HOME + '/Final Project/data/moves.csv'
CSV_MOVESETS = HOME + '/Final Project/data/movesets.csv'
CSV_POKEMON = HOME + '/Final Project/data/pokemon.csv'
CSV_COMPETITIVE = HOME + '/Final Project/data/gen7ubers-1500.csv'
CSV_COMP_GEN6 = HOME + '/Final Project/data/gen6ubers-1500.csv'


def main():
    ''' Call testing methods: should return only True in console
    print(test.test_rq1())
    print(test.test_rq2())
    print(test.test_rq3())
    '''
    # ''' Uncomment block to run program
    # Research Question 1
    research_q_1 = Rq1(CSV_FULL_DEX)
    research_q_1.plot_avg_stats_by_gen()
    # Research Question 2
    research_q_2 = Rq2(CSV_MOVES, CSV_MOVESETS, CSV_POKEMON, CSV_COMPETITIVE)
    research_q_2.plot_move_percent()
    research_q_2.plot_by_stats()
    research_q_2.plot_by_type()
    research_q_2b = Rq2(CSV_MOVES, CSV_MOVESETS, CSV_POKEMON, CSV_COMP_GEN6)
    # Research Question 3
    research_q_3 = Rq3(research_q_2.get_merged_data())
    research_q_3.decision_tree_model('gen7')
    research_q_3b = Rq3(research_q_2b.get_merged_data())
    research_q_3b.decision_tree_model('gen6')
    # '''


if __name__ == '__main__':
    main()
