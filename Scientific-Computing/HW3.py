import numpy as np
from scipy.integrate import odeint
from scipy.integrate import solve_ivp
from scipy.sparse.linalg import eigs
import matplotlib.pyplot as plt

### PART A ###
col = ['r', 'b', 'g', 'c', 'm']  # eigenfunc colors
tol = 1e-4; L = 4; L_Len = 2*L*10; xp = [-L,L]
xshoot = np.linspace(xp[0],xp[1],L_Len+1)
eps_start = 0.1

A1 = np.zeros([L_Len+1,0])
A2 = np.array([0.0,0.0,0.0,0.0,0.0])

def shoot2(x, phi, eps):
  return [phi[1], (x**2-eps)*phi[0]]

for modes in range(1, 6):  # begin mode loop
    eps = eps_start  # initial value of eigenvalue beta
    deps = 0.2  # default step size in beta

    for _ in range(1000):  # begin convergence loop for beta
        eps0 = [1, np.sqrt(16-eps)]

        # y = odeint(shoot2, eps0, xshoot, args=(eps,))
        y = solve_ivp(shoot2, xp, eps0, t_eval=xshoot, args=(eps,))
        y = y.y.T
        if abs(y[-1, 1] + np.sqrt(16-eps)*y[-1,0]) < tol:  # check for convergence
            break  # get out of convergence loop
        if (-1) ** (modes + 1) * (y[-1, 1] + np.sqrt(16-eps)*y[-1,0]) > 0:
            eps += deps
        else:
            eps -= deps / 2
            deps /= 2
    eps_start = eps + 0.1  # after finding eigenvalue, pick new start
    norm = np.trapz(y[:, 0] * y[:, 0], xshoot)  # calculate the normalization
    # plt.plot(xshoot, y[:, 0] / np.sqrt(norm), col[modes - 1], label=("eig fn" + (str)(modes)))  # plot modes
    A1 = np.column_stack((A1, y[:,0] / np.sqrt(norm)))
    A2[modes-1] = eps

A1 = abs(A1)

### PART B ###

L = 4; L_Len = 2*L*10; xp = [-L,L]; dx = 0.1
xshoot = np.linspace(xp[0],xp[1],L_Len+1)

A3 = np.zeros([L_Len+1,0])
A4 = np.array([0.0,0.0,0.0,0.0,0.0])

# Matrix A
A = np.zeros([79,79])
A[0,0] = 2/3 + dx*dx*xshoot[1]**2
A[0,1] = -2/3
for i in range(1,78):
  A[i,i-1] = -1
  A[i,i] = 2 + dx*dx*xshoot[i+1]**2
  A[i,i+1] = -1

A[78,77] = -2/3
A[78,78] = 2/3 + dx*dx*xshoot[79]**2

# Direct Solve
D,V = eigs(A, k=5, which="SM")

D5 = D[:5]
V5 = V[:,:5]

D5 = D5.real / dx**2

# Add boundary values
Efuncs = np.zeros((81,0))
for i in range(5):
    temp = V5[:, i]
    vec = np.concatenate([[(4 * temp[1] - temp[0]) / (3 + 2 * dx * np.sqrt(16 - D5[i]))],
                         temp,
                         [(4 * temp[77] - temp[78]) / (3 + 2 * dx * np.sqrt(16 - D5[i]))]])
    vec = vec / np.sqrt(np.trapz(vec*vec, xshoot))

    # print(vec[0])
    Efuncs = np.column_stack((Efuncs, vec))
V5 = Efuncs

# Answers
A3 = abs(V5)
A4 = D5
#print(A3)

# Plot
"""
for i in range(0,5):
  # plt.plot(xshoot, V5[:,i], col[i],label=("eig fn" + (str)(i+1)))
  plt.plot(xshoot, abs(V5[:,i]), col[i])
#print(V5)
print(D5)
plt.legend()
plt.show()
"""

### PART C ###
#"""
tol = 1e-4; L = 2; L_Len = 2*L*10; xp = [-L,L]; dx = 0.1
xshoot = np.linspace(xp[0],xp[1],L_Len+1)
eps_start = 0.1
gamma = 0.05
A = 1e-6
xs=[]
ys=[]

A5 = np.zeros([L_Len+1,0])
A6 = np.array([0.0,0.0])

# Define Shoot Function
def shoot3(x, phi, eps):
  return [phi[1], (gamma * phi[0]**2 + x**2-eps)*phi[0]]

# Shoot
for modes in range(1, 3):  # begin mode loop
  dA = 0.01

  for jj in range(100):
    eps = eps_start  # initial value of eigenvalue beta
    deps = 0.2  # default step size in beta
    """
    if (modes == 2):
       eps=2.8
    """
    for _ in range(1000):  # begin convergence loop for beta
      y0 = [A, A*np.sqrt(4-eps)]

      #sol = solve_ivp(shoot3, xp, y0, t_eval=xshoot, args=(eps,))
      sol = solve_ivp(lambda xshoot, y: shoot3(xshoot, y, eps), [xshoot[0], xshoot[-1]], y0, t_eval=xshoot)

      ys = sol.y.T
      xs = sol.t

      # Check Boundary Conditions
      if abs(ys[-1, 1] + np.sqrt(4-eps)*ys[-1,0]) < tol:  # check for convergence
          #print("eps break:",eps)  # write out eigenvalue
          break  # get out of convergence loop

      if (-1) ** (modes + 1) * (ys[-1, 1] + np.sqrt(4-eps)*ys[-1,0]) > 0:
          eps += deps
      else:
          eps -= deps / 2
          deps /= 2
    Area = np.trapz(ys[:,0]**2, xs)
    if (abs(Area-1) < tol):
      #print("A break:", Area)
      break
    if (Area < 1):
      #print("+++")
      A += dA
    else:
      #print("---")
      A -= dA
      dA /= 2
    #print("area:",Area)

  #print("eval:", eps)
  eps_start = eps + 0.2  # after finding eigenvalue, pick new start
  norm = np.trapz(ys[:, 0] * ys[:, 0], xshoot)  # calculate the normalization
  #plt.plot(xshoot, abs(ys[:, 0]) / np.sqrt(norm), col[modes - 1], label=("eig fn" + (str)(modes)))  # plot modes
  A5 = np.column_stack((A5, ys[:,0] / np.sqrt(norm)))
  A6[modes-1] = eps
A5 = abs(A5)

#print(A5)
#print(A6)

### GAMMA -0.05
tol = 1e-4; L = 2; L_Len = 2*L*10; xp = [-L,L]; dx = 0.1
xshoot = np.linspace(xp[0],xp[1],L_Len+1)
eps_start = 0.1
gamma = -0.05
A = 1e-6
xs=[]
ys=[]

A7 = np.zeros([L_Len+1,0])
A8 = np.array([0.0,0.0])

# Define Shoot Function
def shoot3(x, phi, eps):
  return [phi[1], (gamma * phi[0]**2 + x**2-eps)*phi[0]]

# Shoot
for modes in range(1, 3):  # begin mode loop
  dA = 0.01

  for jj in range(100):
    eps = eps_start  # initial value of eigenvalue beta
    deps = 0.2  # default step size in beta

    for _ in range(1000):  # begin convergence loop for beta
      y0 = [A, A*np.sqrt(4-eps)]

      #sol = solve_ivp(shoot3, xp, y0, t_eval=xshoot, args=(eps,))
      sol = solve_ivp(lambda xshoot, y: shoot3(xshoot, y, eps), [xshoot[0], xshoot[-1]], y0, t_eval=xshoot)

      ys = sol.y.T
      xs = sol.t

      # Check Boundary Conditions
      if abs(ys[-1, 1] + np.sqrt(4-eps)*ys[-1,0]) < tol:  # check for convergence
          break  # get out of convergence loop

      if (-1) ** (modes + 1) * (ys[-1, 1] + np.sqrt(4-eps)*ys[-1,0]) > 0:
          eps += deps
      else:
          eps -= deps / 2
          deps /= 2
    Area = np.trapz(ys[:,0]**2, xs)
    if (abs(Area-1) < tol):
      break
    if (Area < 1):
      A += dA
    else:
      A -= dA
      dA /= 2

  eps_start = eps + 0.2  # after finding eigenvalue, pick new start
  norm = np.trapz(ys[:, 0] * ys[:, 0], xshoot)  # calculate the normalization
  plt.plot(xshoot, abs(ys[:, 0]) / np.sqrt(norm), col[modes - 1], label=("eig fn" + (str)(modes)))  # plot modes
  A7 = np.column_stack((A7, ys[:,0] / np.sqrt(norm)))
  A8[modes-1] = eps
A7 = abs(A7)

#print(A7)
#print(A8)

### PART D ###

eps = 1; L = 2; L_Len = 2*L*10
xspan = [-L,L]
phi0 = [1, np.sqrt(3)]
TOL = [1e-4, 1e-5, 1e-6, 1e-7, 1e-8, 1e-9, 1e-10]
METHODS = ['RK45', 'RK23', 'Radau', 'BDF']

def shoot2(x, phi, eps):
  return [phi[1], (x**2-eps)*phi[0]]

slopes = np.zeros(len(METHODS))

for i in range(len(METHODS)):
  step_sizes = np.zeros(len(TOL))
  for j in range(len(TOL)):
    options = {'rtol': TOL[j], 'atol': TOL[j]}
    sol = solve_ivp(shoot2, xspan, phi0, method=METHODS[i], args=(eps,), **options)
    step_sizes[j] = (np.diff(sol.t).mean())
  slope, _ = np.polyfit(np.log(step_sizes), np.log(TOL), 1)
  slopes[i] = slope
  #plt.loglog(step_sizes, TOL, col[i], label="f{METHODS}")

A9 = slopes
#print(A9)

### PART E ###
L = 4; L_Len = 2*L*10; xp = [-L,L]
xshoot = np.linspace(xp[0],xp[1],L_Len+1)

def ef1(x):
   return abs((np.pi**(-0.25) * np.exp(-0.5 * x**2)))
def ef2(x):
   return abs((np.sqrt(2)*np.pi**(-0.25) * x * np.exp(-0.5*x**2)))
def ef3(x):
   return abs(((np.sqrt(2)*np.pi**(0.25))**-1 * (2*x**2 - 1) * np.exp(-0.5*x**2)))
def ef4(x):
   return abs(((np.sqrt(3)*np.pi**(0.25))**-1 * (2*x**3 - 3*x) * np.exp(-0.5*x**2)))
def ef5(x):
   return abs(((2*np.sqrt(6)*np.pi**(0.25))**-1 * (4*x**4 - 12*x**2 + 3) * np.exp(-0.5*x**2)))

efExact = np.zeros([81, 5])
evExact = np.array([1,3,5,7,9])
for i in range(80):
   efExact[i,0] = ef1(xshoot[i])
   efExact[i,1] = ef2(xshoot[i])
   efExact[i,2] = ef3(xshoot[i])
   efExact[i,3] = ef4(xshoot[i])
   efExact[i,4] = ef5(xshoot[i])

funDiff = np.zeros(5)
valDiff = np.zeros(5)
for i in range(5):
  funDiff[i] = np.trapz((A1[:,i] - efExact[:,i])**2, xshoot)
  valDiff[i] = 100 * (abs(evExact[i] - A2[i])/evExact[i])

A10 = funDiff
A11 = valDiff

funDiff = np.zeros(5)
valDiff = np.zeros(5)
for i in range(5):
  funDiff[i] = np.trapz((A3[:,i] - efExact[:,i])**2, xshoot)
  valDiff[i] = 100 * (abs(evExact[i] - A4[i])/evExact[i])
A12 = funDiff
A13 = valDiff
#print(funDiff)
#print(valDiff)

print(A10)
print(A11)

#"""
plt.legend()
plt.show()
#"""