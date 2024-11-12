
import numpy as np
from scipy.integrate import odeint
import matplotlib.pyplot as plt

col = ['r', 'b', 'g', 'c', 'm']  # eigenfunc colors
tol = 1e-4; L = 4; L_Len = 2*L*10; xp = [-L,L]
xshoot = np.linspace(xp[0],xp[1],L_Len+1)
eps_start = 0.1

A1 = np.zeros([L_Len+1,0])
A2 = np.array([0.0,0.0,0.0,0.0,0.0])

def shoot2(phi, x, eps):
  return [phi[1], (x**2-eps)*phi[0]]

for modes in range(1, 6):  # begin mode loop
    eps = eps_start  # initial value of eigenvalue beta
    deps = 0.2  # default step size in beta

    for _ in range(1000):  # begin convergence loop for beta
        # y0 = [y1, y2] = [y, np.sqrt(L**2-eps)*y]
        eps0 = [1, np.sqrt(16-eps)]

        y = odeint(shoot2, eps0, xshoot, args=(eps,))
        if abs(y[-1, 1] + np.sqrt(16-eps)*y[-1,0]) < tol:  # check for convergence
            # print(eps)  # write out eigenvalue
            break  # get out of convergence loop

        # if (-1) ** (modes + 1) * y[-1, 0] > 0:
        if (-1) ** (modes + 1) * (y[-1, 1] + np.sqrt(16-eps)*y[-1,0]) > 0:
            eps += deps
        else:
            eps -= deps / 2
            deps /= 2

    # print(eps)
    eps_start = eps + 0.1  # after finding eigenvalue, pick new start
    norm = np.trapz(y[:, 0] * y[:, 0], xshoot)  # calculate the normalization
    plt.plot(xshoot, y[:, 0] / np.sqrt(norm), col[modes - 1], label=("eig fn" + (str)(modes)))  # plot modes
    A1 = np.column_stack((A1, y[:,0] / np.sqrt(norm)))
    A2[modes-1] = eps

A1 = abs(A1)
print(A2)
print(A2.shape)
# print(A1[0,0], A1[-1,0])
# print(A1)
print(A1.shape)
plt.legend()
plt.show()