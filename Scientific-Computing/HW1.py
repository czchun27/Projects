"""
Coby Chun
AMATH 481
Homework 1
10/4/2024
"""
import numpy as np

### Problem 1 ###
# Part 1
x1 = -1.6 # Starting x value for Newton-Raphson method
A1 = np.array([x1])
for t1 in range(1, 100):
  # x(n+1) = x(n) - f(x(n))/f'(x(n))
  x2 = x1 - (x1*np.sin(3*x1) - np.exp(x1)) / (np.sin(3*x1) + 3*x1*np.cos(3*x1) - np.exp(x1))
  A1 = np.append(A1, [x2]) # Add x(n+1) to answer vector
  if abs(x2 - x1) < 1e-6:
    break
  else:
    x1 = x2
A3 = np.array([t1]) # Add number of iterations for Newton-Raphson to answer vector

# Part 2
xl = -0.7 # Starting left bound
xr = -0.4 # Starting right bound
A2 = np.array([])
for t2 in range(1, 100):
  xm = (xl + xr)/2
  A2 = np.append(A2, [xm]) # Add mid point to answer vector
  f = xm * np.sin(3*xm) - np.exp(xm)
  if f > 0:
    xl = xm
  else:
    xr = xm
  if (abs(f) < 1e-6):
    break
A3 = np.append(A3, t2) # Add number of iterations for Bisection to answer vector

'''
print("A1:", A1)
print("A2:", A2)
print("A3:", A3)
'''

### Problem 2 ###
A = np.matrix([[1,2],[-1,1]])
B = np.matrix([[2,0],[0,2]])
C = np.matrix([[2,0,-3],[0,0,-1]])
D = np.matrix([[1,2],[2,3],[-1,0]])
x = np.array([[1],[0]])
y = np.array([[0],[1]])
z = np.array([[1],[2],[-1]])

# a)
A4 = A+B
# print(A4)

# b)
A5 = 3*x - 4*y
A5 = np.squeeze(np.asarray(A5))
# print(A5.shape)
# print(A5)

# c)
A6 = A * x
A6 = np.squeeze(np.asarray(A6))
# print(A6)

# d)
A7 = B * (x - y)
A7 = np.squeeze(np.asarray(A7))
# print(A7)

# e)
A8 = D * x
A8 = np.squeeze(np.asarray(A8))
# print(A8)

# f)
A9 = D * y + z
A9 = np.squeeze(np.asarray(A9))
# print(A9)

# g)
A10 = A * B
#print(A10)

# h)
A11 = B * C
# print(A11)

# i)
A12 = C * D
# print(A12)