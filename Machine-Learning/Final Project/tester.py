'''
Coby Chun
CSE 163 AF

Testing File: Used to test methods in rq1, rq2, and rq3
'''
from rq1 import Rq1
from rq2 import Rq2
from rq3 import Rq3

HOME = 'C:/Users/cando/Desktop/School/UW CSE163'
TESTRQ1 = HOME + '/Final Project/testing/testrq1.csv'
CSV_MOVES = HOME + '/Final Project/data/moves.csv'
TESTRQ2MSET = HOME + '/Final Project/testing/testrq2mset.csv'
TESTRQ2PKMN = HOME + '/Final Project/testing/testrq2pkmn.csv'
TESTRQ2COMP = HOME + '/Final Project/testing/testrq2comp.csv'


def test_rq1() -> bool:
    '''
    Tests the _assign_gen and _dex_by_gens
    methods in rq1
    '''
    r1 = Rq1(TESTRQ1)
    if r1._assign_gen(1) != 1:
        return False
    if r1._assign_gen(15000) != 9:
        return False
    a = r1._dex_by_gens(r1._full_dex)
    if 'gen' not in a.columns:
        return False
    return True


def test_rq2() -> bool:
    '''
    Tests the initialization of Rq2's merged
    data frame
    '''
    r2 = Rq2(CSV_MOVES, TESTRQ2MSET, TESTRQ2PKMN, TESTRQ2COMP)
    data = r2._merged_data
    if data.loc[0, 'id'] != 0 | data.loc[0, 'is_atker'] != 1:
        print(r2._merged_data.head)
        return False
    if len(data.loc[:, 'percent_good_moves']) != 2:
        return False
    return True


def test_rq3() -> bool:
    '''
    Tests the initialization of Rq3's merged data
    frame and the method _reduce_cols
    '''
    r2 = Rq2(CSV_MOVES, TESTRQ2MSET, TESTRQ2PKMN, TESTRQ2COMP)
    r3 = Rq3(r2.get_merged_data())
    if 'id' in r3._merged_data.columns:
        return False
    if 'Usage %' not in r3._merged_data.columns:
        return False
    return True
