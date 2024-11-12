'''
Coby Chun
CSE 163 AF

Final Project: Competitive Pokemon Visualizations
Research Question 3: Can we use machine learning to accurately predict
where a pokemon may place in competitive Pokémon rankings?

To answer this question we will look at data from Gen 6 and 7 Ubers and
try to train a decision tree to predict the usage percentage of a pokemon
given it's stats, typing, and percentage of good moves. Will also use
scipy stats to perform ML linear regression on the models to help continue
analysis on RQ2.
Note: Gen 6 dataset is half the size of Gen 7, so more error makes sense
'''
import pandas as pd
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import matplotlib.pyplot as plt
from scipy import stats
import numpy as np


class Rq3:
    def __init__(self, merged_data: pd.DataFrame) -> None:
        '''
        Formats given dataset for splitting into relavent features and
        labels
        '''
        self._merged_data = self._reduce_cols(merged_data)

    def _reduce_cols(self, data: pd.DataFrame) -> pd.DataFrame:
        '''
        Drops the columns of the given dataset to include only relavent
        columns for features and labels
        '''
        data = data.drop(data.loc[:, 'weight':'Pokemon'], axis=1)
        data = data.drop(data.loc[:, :'forme'], axis=1)
        data = data.drop(data.loc[:, 'Raw':'is_atker'], axis=1)
        data = data.drop(data.loc[:, 'ability1':'abilityH'], axis=1)
        return data

    def decision_tree_model(self, name: str = None) -> None:
        '''
        Creates a decision tree model and plots a comparison
        between the model's predictions and actual data. Also performs
        linear regression on those plots using scipy stats.
        Prints the mean squared error of the model (test size is 15%)
        Prints the correlation Coefficient of each linear regression line
        (|values| close to 0 show little correlation, |values| near 1 show
        near perfect correlation)
        Stores the plot as model_comparison_[given name].png
        '''
        data = self._merged_data
        features = data.loc[:, data.columns != 'Usage %']
        features = pd.get_dummies(features)
        labels = data['Usage %']
        features_train, features_test, labels_train, labels_test = \
            train_test_split(features, labels, test_size=0.15, random_state=1)
        model = DecisionTreeRegressor()
        model.fit(features_train, labels_train)
        train_pred = model.predict(features_train)
        print('Basic Model Training error:',
              mean_squared_error(labels_train, train_pred))
        test_pred = model.predict(features_test)
        print('Basic Model Testing error:',
              mean_squared_error(labels_test, test_pred))

        figure, [[ax1, ax2], [ax3, ax4]] = plt.subplots(2, 2, figsize=(15, 7))
        ax1.scatter(features_train['total'], labels_train,
                    label='Training Data')
        ax1.scatter(features_test['total'], labels_test, color='red',
                    label='Testing Data')
        ax2.scatter(features_train['total'], train_pred,
                    label='Training Predictions')
        ax2.scatter(features_test['total'], test_pred, color='red',
                    label='Testing Predictions')
        ax3.scatter(features_train['percent_good_moves'],
                    labels_train, label='Training Data')
        ax3.scatter(features_test['percent_good_moves'],
                    labels_test, color='red', label='Testing Data')
        ax4.scatter(features_train['percent_good_moves'],
                    train_pred, label='Training Predictions')
        ax4.scatter(features_test['percent_good_moves'],
                    test_pred, color='red', label='Testing Predictions')
        ax1.legend(loc='best')
        ax2.legend(loc='best')
        ax3.legend(loc='best')
        ax4.legend(loc='best')
        ax1.set_title('Data: Usage Percent by Base Stats')
        ax2.set_title('Model: Usage Percent by Base Stats')
        ax3.set_title('Data: Usage Percent by Moveset')
        ax4.set_title('Model: Usage Percent by Moveset')
        # Linear Regression using scipy stats
        slope1, intercept1, r1, p, std_err = \
            stats.linregress(list(features_test['total']), list(labels_test))
        slope2, intercept2, r2, p, std_err = \
            stats.linregress(list(features_test['total']), list(test_pred))
        slope3, intercept3, r3, p, std_err = \
            stats.linregress(list(features_test['percent_good_moves']),
                             list(labels_test))
        slope4, intercept4, r4, p, std_err = \
            stats.linregress(list(features_test['percent_good_moves']),
                             list(test_pred))

        self._lin_reg_relationship([r1, r2, r3, r4])

        x1 = np.arange(min(features['total']), max(features['total']), 10)
        x2 = np.arange(min(features['percent_good_moves']),
                       max(features['percent_good_moves']), 10)
        line1 = slope1 * x1 + intercept1
        line2 = slope2 * x1 + intercept2
        line3 = slope3 * x2 + intercept3
        line4 = slope4 * x2 + intercept4

        ax1.plot(x1, line1, color='green')
        ax2.plot(x1, line2, color='green')
        ax3.plot(x2, line3, color='green')
        ax4.plot(x2, line4, color='green')

        if name is None:
            plt.savefig('model_comparison_default.png')
        else:
            plt.savefig('model_comparison_' + name + '.png')

    def _lin_reg_relationship(self, relationships: list) -> None:
        '''
        Prints the correlation coefficient of each plot's linear
        regression line
        '''
        for i in range(len(relationships)):
            r = relationships[i]
            print('Plot', i + 1, 'has a correlation coefficient of', r)
