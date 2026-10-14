## 2021 第十三届CMC补赛 非数学类 填空1
类型: 填空
知识点: 数列极限, Stolz定理, 泰勒展开
难度: 4
分值: 5
题目: 设 $x_0=1$，$x_n=\ln(1+x_{n-1})$（$n\geq1$），则 $\displaystyle\lim_{n\to\infty}nx_n=$ ＿＿＿
答案: 2
解析:
$x_n\in(0,1)$ 单调减少且 $\displaystyle\lim_{n\to\infty}x_n=0$。由 Stolz 定理，得

$$\lim_{n\to\infty}\frac{1}{nx_n}=\lim_{n\to\infty}\left(\frac{1}{x_{n+1}}-\frac{1}{x_n}\right)=\lim_{n\to\infty}\frac{x_n-x_{n+1}}{x_nx_{n+1}}$$

$$=\lim_{n\to\infty}\frac{x_n-\ln(1+x_n)}{x_n\ln(1+x_n)}=\lim_{n\to\infty}\frac{x_n-\left[x_n-\dfrac{1}{2}x_n^2+o(x_n^2)\right]}{x_n^2}=\frac{1}{2}$$

故 $\displaystyle\lim_{n\to\infty}nx_n=2$。

## 2021 第十三届CMC补赛 非数学类 填空2
类型: 填空
知识点: 定积分, 换元法, 三角恒等变换
难度: 3
分值: 5
题目: 积分 $\displaystyle\int_0^{\frac{\pi}{2}}\frac{\cos x}{1+\tan x}dx=$ ＿＿＿
答案: ln(1+sqrt(2))/sqrt(2)
备选: \frac{1}{\sqrt{2}}\ln(1+\sqrt{2})
解析:
作变换 $x=\dfrac{\pi}{2}-t$，则 $\displaystyle\int_0^{\frac{\pi}{2}}\frac{\cos x}{1+\tan x}dx=\int_0^{\frac{\pi}{2}}\frac{\sin t}{1+\cot t}dt=\int_0^{\frac{\pi}{2}}\frac{\sin x}{1+\cot x}dx$。

于是

$$\int_0^{\frac{\pi}{2}}\frac{\cos x}{1+\tan x}dx=\frac{1}{2}\left(\int_0^{\frac{\pi}{2}}\frac{\cos x}{1+\tan x}dx+\int_0^{\frac{\pi}{2}}\frac{\sin x}{1+\cot x}dx\right)$$

$$=\frac{1}{2}\int_0^{\frac{\pi}{2}}\frac{1}{\cos x+\sin x}dx=\frac{1}{2\sqrt{2}}\int_0^{\frac{\pi}{2}}\frac{1}{\sin\left(x+\dfrac{\pi}{4}\right)}dx=\frac{1}{2\sqrt{2}}\int_0^{\frac{\pi}{2}}\csc\left(x+\frac{\pi}{4}\right)dx$$

$$=\frac{1}{2\sqrt{2}}\int_0^{\frac{\pi}{2}}\csc\left(x+\frac{\pi}{4}\right)d\left(x+\frac{\pi}{4}\right)$$

$$=\frac{1}{2\sqrt{2}}\ln\left|\csc\left(x+\frac{\pi}{4}\right)-\cot\left(x+\frac{\pi}{4}\right)\right|\Bigg|_0^{\frac{\pi}{2}}$$

$$=\frac{1}{\sqrt{2}}\ln(1+\sqrt{2}).$$

## 2021 第十三届CMC补赛 非数学类 填空3
类型: 解答
知识点: 解析几何, 平面束, 投影直线
难度: 4
分值: 14
题目: 已知直线 $L:\begin{cases}2x-4y+z=0\\ 3x-y-2z=9\end{cases}$ 和平面 $\pi:4x-y+z=1$，则直线 $L$ 在平面 $\pi$ 上的投影直线方程为
答案: 见结论：所求直线为 $17x+31y-37z-117=0$ 与 $4x-y+z-1=0$ 的交线。
解析:
所求投影直线为过 $L$ 且垂直于 $\pi$ 的平面 $\pi_1$ 与 $\pi$ 的交线，因此需要先求出过 $L$ 且垂直于 $\pi$ 的平面 $\pi_1$ 的方程。

过 $L$ 的平面束方程为

$$\lambda(2x-4y+z)+\mu(3x-y-2z-9)=0,$$

即

$$(2\lambda+3\mu)x-(4\lambda+\mu)y+(\lambda-2\mu)z-9\mu=0.\tag{1}$$

平面 $\pi$ 的法向量为 $\vec{n}=(4,-1,1)$。

因平面 $\pi_1$ 与平面 $\pi$ 垂直，则必须有

$$4(2\lambda+3\mu)+(-1)(-4\lambda-\mu)+1\cdot(\lambda-2\mu)=0$$

解之，得 $\dfrac{\lambda}{\mu}=-\dfrac{11}{13}$。

由 (1)，得到平面 $\pi_1$ 的方程

$$17x+31y-37z-117=0.$$

故所求投影直线为

$$\begin{cases}17x+31y-37z-117=0\\ 4x-y+z-1=0\end{cases}$$

## 2021 第十三届CMC补赛 非数学类 填空4
类型: 填空
知识点: 级数求和, 反正切, 裂项
难度: 3
分值: 5
题目: $\displaystyle\sum_{n=1}^{\infty}\arctan\frac{2}{4n^2+4n+1}=$ ＿＿＿
答案: pi/2-arctan(2)
解析:
由 $\tan(\alpha-\beta)=\dfrac{\tan\alpha-\tan\beta}{1+\tan\alpha\tan\beta}$ 及 $\dfrac{2}{4n^2+4n+1}=\dfrac{(2n+2)-2n}{1+2n(2n+2)}$，得

$$\arctan\frac{2}{4n^2+4n+1}=\arctan(2n+2)-\arctan(2n).$$

故

$$\sum_{n=1}^{\infty}\arctan\frac{2}{4n^2+4n+1}=\lim_{N\to+\infty}\sum_{n=1}^{N}\left[\arctan(2n+2)-\arctan(2n)\right]$$

$$=\lim_{N\to+\infty}\left[\arctan(2N+2)-\arctan 2\right]=\frac{\pi}{2}-\arctan 2.$$

## 2021 第十三届CMC补赛 非数学类 填空5
类型: 填空
知识点: 一阶线性微分方程, 初值问题
难度: 3
分值: 5
题目: 微分方程 $\begin{cases}(x+1)\dfrac{dy}{dx}+1=2e^{-y}\\ y(0)=0\end{cases}$ 的解是＿＿＿
答案: ln((2x+1)/(x+1))
解析:
方程变形为：$e^y\dfrac{dy}{dx}=-\dfrac{1}{x+1}e^y+\dfrac{2}{x+1}$。

即 $\dfrac{de^y}{dx}=-\dfrac{1}{x+1}e^y+\dfrac{2}{x+1}$，

$$e^y=e^{-\int\frac{1}{x+1}dx}\left[\int\frac{2}{x+1}e^{\int\frac{1}{x+1}dx}dx+C\right]=\frac{1}{x+1}\left[\int 2\,dx+C\right]=\frac{1}{x+1}\left[2x+C\right]$$

由 $y(0)=0$，得到 $C=1$，

所以 $e^y=\dfrac{2x+1}{x+1}$，故 $y=\ln\dfrac{2x+1}{x+1}$。

## 2021 第十三届CMC补赛 非数学类 解答二
类型: 解答
知识点: 变限积分, 函数零点, 单调性, 偶函数
难度: 4
分值: 14
题目: （14 分）设 $f(x)=-\dfrac{1}{2}\left(1+\dfrac{1}{e}\right)+\displaystyle\int_{-1}^{1}|x-t|e^{-t^2}dt$。证明：在区间 $(-1,1)$ 内，$f(x)$ 有且仅有两个实根。
答案: 见结论：$f(x)$ 在 $(-1,1)$ 内恰有两个实根 $\pm\xi$（$0<\xi<1$）。$f$ 为偶函数，且 $f'(x)=2\displaystyle\int_0^xe^{-t^2}dt>0$（$0<x<1$）故在 $(0,1)$ 严格单调增。
解析:
$$f(x)=-\frac{1}{2}\left(1+\frac{1}{e}\right)+\int_{-1}^{x}(x-t)e^{-t^2}dt+\int_x^1(t-x)e^{-t^2}dt$$

$$=-\frac{1}{2}\left(1+\frac{1}{e}\right)+x\int_{-1}^xe^{-t^2}dt-\int_{-1}^xte^{-t^2}dt+\int_x^1te^{-t^2}dt-x\int_x^1e^{-t^2}dt$$

$$=-\frac{1}{2}\left(1+\frac{1}{e}\right)+x\int_{-1}^xe^{-t^2}dt+\frac{1}{2}e^{-t^2}\Big|_{-1}^x-\frac{1}{2}e^{-t^2}\Big|_x^1+x\int_{-1}^xe^{-t^2}dt-x\int_{-1}^xe^{-t^2}dt+2x\int_0^xe^{-t^2}dt$$

$$=-\frac{1}{2}-\frac{3}{2}e^{-1}+e^{-x^2}+2x\int_0^xe^{-t^2}dt.$$

显然，$f(x)$ 是偶函数，所以我们只需考察 $f(x)$ 在 $(0,1)$ 内的零点。由于

$$f(0)=\frac{1}{2}-\frac{3}{2}e^{-1}=\frac{e-3}{2e}<0,$$

$$f(1)=-\frac{1}{2}-\frac{3}{2}e^{-1}+e^{-1}+2\int_0^1e^{-t^2}dt>-\left(\frac{1}{2}+\frac{1}{2}e^{-1}\right)+2\int_0^1e^{-t^2}dt=\frac{3}{2}-\frac{5}{2}e^{-1}>0,$$

又 $f(x)$ 在 $[0,1]$ 上连续，由闭区间上连续函数的零点定理，一定存在 $\xi\in(0,1)$，使 $f(\xi)=0$。

由于 $\forall x\in(0,1)$，$f'(x)=2\displaystyle\int_0^xe^{-t^2}dt>0$，则 $f(x)$ 在 $(0,1)$ 内严格单调递增，所以 $f(x)$ 在 $(0,1)$ 内仅有一个实根。

因为 $f(x)$ 是偶函数，它在 $(-1,0)$ 内也仅有一个实根。因此 $f(x)$ 在 $(-1,1)$ 内仅有两个实根。

## 2021 第十三届CMC补赛 非数学类 解答三
类型: 解答
知识点: Green公式, 极坐标, 泰勒公式, 极限
难度: 5
分值: 14
题目: （14 分）设函数 $f(x,y)$ 在闭区域 $D=\{(x,y)\,|\,x^2+y^2\leq1\}$ 上具有二阶连续偏导数，且 $\dfrac{\partial^2f}{\partial x^2}+\dfrac{\partial^2f}{\partial y^2}=x^2+y^2$，求 $\displaystyle\lim_{r\to0^+}\frac{\displaystyle\iint_{r^2\leq x^2+y^2\leq1}\left(x\dfrac{\partial f}{\partial x}+y\dfrac{\partial f}{\partial y}\right)dxdy}{(\tan r-\sin r)^3}$。
答案: $\dfrac{\pi}{3}$
解析:
对 $\forall 0<r\leq1$，设 $D_r=\{(x,y)\in R^2\,|\,x^2+y^2\leq r^2\}$，由 Green 公式，得

$$\iint_{D}\left(x\frac{\partial f}{\partial x}+y\frac{\partial f}{\partial y}\right)dxdy=-\frac{1}{2}\iint_D\left(x^2+y^2\right)\left(\frac{\partial^2f}{\partial x^2}+\frac{\partial^2f}{\partial y^2}\right)dxdy$$

$$+\frac{1}{2}\oint_{\partial D}-\left(x^2+y^2\right)\frac{\partial f}{\partial y}dx+\left(x^2+y^2\right)\frac{\partial f}{\partial x}dy$$

$$=\frac{r^2}{2}\iint_{D_r}\left(\frac{\partial^2f}{\partial x^2}+\frac{\partial^2f}{\partial y^2}\right)dxdy-\frac{1}{2}\iint_{D_r}\left(x^2+y^2\right)\left(\frac{\partial^2f}{\partial x^2}+\frac{\partial^2f}{\partial y^2}\right)dxdy$$

$$=\pi r^2\int_0^rs^3ds-\pi\int_0^rs^5ds=\frac{\pi}{4}r^6-\frac{\pi}{6}r^6=\frac{\pi}{12}r^6.$$

因此，由 Taylor 公式，得

$$\lim_{r\to0^+}\frac{\displaystyle\iint_{D_r}\left(x\dfrac{\partial f}{\partial x}+y\dfrac{\partial f}{\partial y}\right)dxdy}{(\tan r-\sin r)^3}=\lim_{r\to0^+}\frac{\dfrac{\pi}{12}r^6}{\left[\left(r+\dfrac{r^3}{3}+o(r^3)\right)-\left(r-\dfrac{r^3}{3!}+o(r^3)\right)\right]^2}$$

$$=\lim_{r\to0^+}\frac{\dfrac{\pi}{12}r^6}{\dfrac{1}{4}r^6+o(r^6)}=\frac{1}{3}\pi.$$

## 2021 第十三届CMC补赛 非数学类 解答四
类型: 解答
知识点: Gauss公式, 二阶常系数线性微分方程, 极限
难度: 5
分值: 14
题目: （14 分）若对于 $R^3$ 中半空间 $\{(x,y,z)\in R^3\,|\,x>0\}$ 内的任意有向光滑封闭曲面 $S$，都有 $\displaystyle\oint_S yf'(x)dydz+y(xf(x)-f'(x))dzdx-xz(\sin x+f'(x))dxdy=0$，其中 $f$ 在 $(0,+\infty)$ 上二阶导数连续且 $\displaystyle\lim_{x\to0^+}f(x)=\lim_{x\to0^+}f'(x)=0$，求 $f(x)$。
答案: $f(x)=e^{\frac{x}{2}}\left(\dfrac{\sqrt{3}}{3}\sin\dfrac{\sqrt{3}}{2}x-\cos\dfrac{\sqrt{3}}{2}x\right)+\cos x,\ \forall x>0$
解析:
任取一定点 $P(x,y,z)\in\{(x,y,z)\in R^3\,|\,x>0\}$，对任意充分小 $\varepsilon>0$，以 $P$ 点为心半径为 $2\varepsilon$ 的有向球面 $S_{2\varepsilon}(P)$ 仍位于此半空间内。记 $B_\varepsilon(P)$ 为球面 $S_\varepsilon(P)$（取外侧）所围内部球。

由题设条件与 Gauss 公式，得：

$$0=\oint_{S_\varepsilon(P)}yf'(x)dydz+y(xf(x)-f'(x))dzdx-xz(\sin x+f'(x))dxdy$$

$$=\iiint_{B_\varepsilon(P)}\left[yf''(x)+xf(x)-f'(x)-x\sin x-xf'(x)\right]dxdydz$$

$$=\rho\left[f''(\rho)-f'(\rho)+f(\rho)-\sin\rho\right]\cdot\frac{4}{3}\pi\varepsilon^3,\ \text{其中}\ |\rho-x|\leq\varepsilon.$$

由此可得 $f''(\rho)-f'(\rho)+f(\rho)-\sin\rho=0$。

令 $\varepsilon\to0^+$，由 $f$ 在 $(0,+\infty)$ 上二阶导数连续得

$$f''(x)-f'(x)+f(x)=\sin x\quad(\forall x>0).\tag{以上方程也可通过反证法得到}$$

求此二阶方程，齐次方程通解为 $e^{\frac{x}{2}}\left(c_1\cos\frac{\sqrt{3}}{2}x+c_2\sin\frac{\sqrt{3}}{2}x\right)$，非齐次方程特解为 $\cos x$，故可得：

$$f(x)=e^{\frac{x}{2}}\left(c_1\cos\frac{\sqrt{3}}{2}x+c_2\sin\frac{\sqrt{3}}{2}x\right)+\cos x,\quad\forall x>0.$$

由 $\displaystyle\lim_{x\to0^+}f(x)=0$ 可得：$c_1=-1$。

再由 $\displaystyle\lim_{x\to0^+}f'(x)=0$，得

$$\lim_{x\to0^+}\left[\frac{x}{2}e^{\frac{x}{2}}\left(\left(c_1+\sqrt{3}c_2\right)\cos\frac{\sqrt{3}}{2}x+\left(c_2-\sqrt{3}c_1\right)\sin\frac{\sqrt{3}}{2}x\right)-\sin x\right]=\frac{c_1+\sqrt{3}c_2}{2}=0,$$

可得：$c_2=\dfrac{\sqrt{3}}{3}$。

因此，$f(x)=e^{\frac{x}{2}}\left(\dfrac{\sqrt{3}}{3}\sin\dfrac{\sqrt{3}}{2}x-\cos\dfrac{\sqrt{3}}{2}x\right)+\cos x,\quad\forall x>0.$

## 2021 第十三届CMC补赛 非数学类 解答五
类型: 解答
知识点: 反常积分敛散性, 绝对收敛与条件收敛, Dirichlet判别法
难度: 5
分值: 14
题目: （14 分）设 $f(x)=\displaystyle\int_0^x\left(1-\frac{[u]}{u}\right)du$，其中 $[x]$ 表示小于等于 $x$ 的最大整数。试讨论 $\displaystyle\int_1^{+\infty}\frac{e^{f(x)}}{x^p}\cos\left(x^2-\frac{1}{x^2}\right)dx$ 的敛散性，其中 $p>0$。
答案: 当 $p>\dfrac{3}{2}$ 时绝对收敛；当 $0<p\leq\dfrac{3}{2}$ 时条件收敛
解析:
$\forall x\geq1$，

$$f(x)=\int_0^1\left(1-\frac{[u]}{u}\right)du+\int_1^x\frac{u-[u]}{u}du$$

$$=\sum_{k=0}^{[x]-1}\int_k^{k+1}\left(1-\frac{k}{u}\right)du+\int_{[x]}^x\frac{u-[x]}{u}du=[x]-\sum_{k=0}^{[x]-1}k\ln\left(1+\frac{1}{k}\right)+O\left(\frac{1}{x}\right)$$

$$=[x]-\sum_{k=0}^{[x]-1}\left[\frac{1}{k}-\frac{1}{2k^2}+\frac{1}{3k^3}+o\left(\frac{1}{k^3}\right)\right]+O\left(\frac{1}{x}\right)=1+\frac{1}{2}\sum_{k=1}^{[x]-1}\frac{1}{k}+O(1)$$

$$=\frac{1}{2}[\ln x]+\frac{1}{2}\left(\sum_{k=1}^{[x]}\frac{1}{k}-\ln[x]\right)+O(1)=\frac{1}{2}\ln x+O(1).$$

故存在 $0<C_1\leq C_2$，使得

$$C_1\sqrt{x}\leq e^{f(x)}\leq C_2\sqrt{x},\qquad\forall x\geq1.\tag{4分}$$

若 $p>\dfrac{3}{2}$，$\left|\dfrac{e^{f(x)}}{x^p}\cos\left(x^2-\dfrac{1}{x^2}\right)\right|\leq\dfrac{C_2}{x^{p-\frac{3}{2}}}$，故原积分绝对收敛。（3分）

再考虑 $0<p\leq\dfrac{3}{2}$。首先，注意到

$$\frac{e^{f(x)}}{x^p}\cos\left(x^2-\frac{1}{x^2}\right)=\frac{e^{f(x)}x^{3-p}}{x^4+1}\cdot\frac{1}{2}\left(x+\frac{1}{x^3}\right)\cos\left(x^2-\frac{1}{x^2}\right),$$

且对任意 $1\leq A<B<+\infty$，成立

$$\left|\int_A^B2\left(x+\frac{1}{x^3}\right)\cos\left(x^2-\frac{1}{x^2}\right)dx\right|=\left|\sin\left(x^2-\frac{1}{x^2}\right)\right|_A^B\leq2.$$

其次，$\dfrac{e^{f(x)}x^{3-p}}{x^4+1}$ 单调递减（对 $x$ 充分大）且趋于 0（当 $x\to+\infty$）。事实上，$\dfrac{x^{4-p}}{x^4+1}$ 单调递减（对 $x$ 充分大），$e^{f(x)-\ln x}=e^{\int_1^x(\frac{1-[u]}{u})du-\ln x}=e^{\int_1^x(\frac{1-[u]}{u})du+1}$ 在 $[1,+\infty)$ 上单调递减。由 Dirichlet 判别法，原积分收敛。（4分）

注意到

$$\left|\frac{e^{f(x)}}{x^p}\cos\left(x^2-\frac{1}{x^2}\right)\right|\geq\frac{e^{f(x)}}{x^p}\cos^2\left(x^2-\frac{1}{x^2}\right)=\frac{e^{f(x)}}{2x^p}\left(\cos\left[2\left(x^2-\frac{1}{x^2}\right)\right]+1\right).$$

类似地可证 $\displaystyle\int_1^{+\infty}\frac{e^{f(x)}}{x^p}\cos\left[2\left(x^2-\frac{1}{x^2}\right)\right]dx$ 收敛，但由于 $\dfrac{e^{f(x)}}{x^p}\geq\dfrac{C_1}{x^p}$，故 $\displaystyle\int_1^{+\infty}\frac{e^{f(x)}}{x^p}dx$ 发散。因此，原积分当 $0<p\leq\dfrac{3}{2}$ 时条件收敛。（3分）

## 2021 第十三届CMC补赛 非数学类 解答六
类型: 解答
知识点: 幂级数, 收敛半径, 反常积分发散
难度: 5
分值: 14
题目: （14 分）设正数列 $\{a_n\}$ 单调减少且趋于零，$f(x)=\displaystyle\sum_{n=1}^{\infty}a_nx^n$。证明：若级数 $\displaystyle\sum_{n=1}^{\infty}a_n$ 发散，则积分 $\displaystyle\int_1^{+\infty}\frac{\ln f(x)}{x^2}dx$ 也发散。
答案: 见结论：$\displaystyle\lim_{X\to+\infty}\int_1^X\frac{\ln f(x)}{x^2}dx=+\infty$。由 $\displaystyle\int_1^X\frac{\ln f(x)}{x^2}dx\ge\frac1e\sum_{p=1}^na_p-\frac nX$ 及 $\sum a_n$ 发散即得。
解析:
因为级数 $\displaystyle\sum_{n=1}^{\infty}a_nx^n$ 的收敛半径 $R=\displaystyle\lim_{n\to\infty}\frac{1}{\sqrt[n]{a_n}}=\lim_{n\to\infty}\frac{1}{a_n}=+\infty$，所以函数 $f(x)$ 的定义域为 $(-\infty,+\infty)$。（2分）

若 $x\in\left[\dfrac{e}{a_p},\dfrac{e}{a_{p+1}}\right]$，则当 $k\leq p$ 时，$a_kx\geq a_px\geq e$（因为 $a_n$ 单调减少）。

因此，$f(x)\geq\displaystyle\sum_{k=1}^p(a_kx)^k\geq\sum_{k=1}^pe^k$。

于是，$\ln f(x)\geq p$（$x\in\left[\dfrac{e}{a_p},\dfrac{e}{a_{p+1}}\right]$）。（6分）

又因为当 $x\geq1$ 时，$f(x)\geq f(1)=\displaystyle\sum_{n=1}^{\infty}a_n>0$。

对固定的 $n$，当 $X>\dfrac{e}{a_n}$ 时，

$$\int_1^X\frac{\ln f(x)}{x^2}dx=\int_1^{\frac{e}{a_1}}\frac{\ln f(x)}{x^2}dx+\sum_{p=1}^{n-1}\int_{\frac{e}{a_p}}^{\frac{e}{a_{p+1}}}\frac{\ln f(x)}{x^2}dx+\int_{\frac{e}{a_n}}^X\frac{\ln f(x)}{x^2}dx$$

$$\geq\sum_{p=1}^{n-1}p\int_{\frac{e}{a_p}}^{\frac{e}{a_{p+1}}}\frac{1}{x^2}dx+n\int_{\frac{e}{a_n}}^X\frac{1}{x^2}dx$$

$$=\frac{1}{e}\sum_{p=1}^{n}a_p-\frac{n}{X}.$$

于是当 $X>\max\left\{n,\dfrac{e}{a_n}\right\}$ 时，$\displaystyle\int_1^X\frac{\ln f(x)}{x^2}dx\geq\frac{1}{e}\sum_{p=1}^{n}a_p-1$。

因为级数 $\displaystyle\sum_{n=1}^{\infty}a_n$ 发散，所以 $\displaystyle\lim_{X\to+\infty}\int_1^X\frac{\ln f(x)}{x^2}dx=+\infty$。（6分）
