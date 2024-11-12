import numpy as np
import matplotlib.pyplot as plt
from scipy.sparse import spdiags

L = 20
m = 8    # N value in x and y directions
n = m * m  # total size of matrix
dx = L/m

### Build A Matrix ###
e0 = np.zeros((n, 1))  # vector of zeros
e1 = np.ones((n, 1))   # vector of ones
e2 = np.copy(e1)    # copy the one vector
e4 = np.copy(e0)    # copy the zero vector

for j in range(1, m+1):
    e2[m*j-1] = 0  # overwrite every m^th value with zero
    e4[m*j-1] = 1  # overwirte every m^th value with one

# Shift to correct positions
e3 = np.zeros_like(e2)
e3[1:n] = e2[0:n-1]
e3[0] = e2[n-1]

e5 = np.zeros_like(e4)
e5[1:n] = e4[0:n-1]
e5[0] = e4[n-1]

# Place diagonal elements
diagonals = [e1.flatten(), e1.flatten(), e5.flatten(),
             e2.flatten(), -4 * e1.flatten(), e3.flatten(),
             e4.flatten(), e1.flatten(), e1.flatten()]
offsets = [-(n-m), -m, -m+1, -1, 0, 1, m-1, m, (n-m)]

matA = spdiags(diagonals, offsets, n, n).toarray()

matA = matA/dx**2

A1 = matA


### Build B Matrix ###
e1 = np.ones((n, 1))   # vector of ones
e2 = np.copy(e1)    # copy the one vector
eb = np.copy(e1)
et = np.copy(e1)

# Place diagonal elements
diagonals = [eb.flatten(), -1 * e1.flatten(),
             e2.flatten(), -1 * et.flatten()]
offsets = [-n+m, -m, m, n-m]

matB = spdiags(diagonals, offsets, n, n).toarray()

matB = matB/(2*dx)

A2 = matB


### Build C Matrix ###
e0 = np.zeros((n, 1))  # vector of zeros
e1 = np.ones((n, 1))   # vector of ones
e2 = np.copy(e1)    # copy the one vector
e3 = np.copy(e0)    # copy the zero vector

for j in range(1, m+1):
    e0[m*j-m] = 1  # overwrite every 1st value with one
    e1[m*j-1] = 0  # overwirte every m^th value with zero
    e2[m*j-m] = 0  # overwrite every 1st value with zero
    e3[m*j-1] = 1  # overwirte every m^th value with one


# Place diagonal elements
diagonals = [e0.flatten(), -1 * e1.flatten(),
             e2.flatten(), -1 * e3.flatten()]
offsets = [1-m, -1, 1, m-1]

matC = spdiags(diagonals, offsets, n, n).toarray()

matC = matC/(2*dx)

A3 = matC

# Plot matrix structure
plt.figure(5)
plt.spy(A1)
plt.title('Matrix Structure')
plt.show()
