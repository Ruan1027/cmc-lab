## 2020 第十二届CMC预赛 非数学类 填空1
类型: 填空
知识点: 极限, 等价无穷小
难度: 2
分值: 5
题目: 极限 $\displaystyle\lim_{x\to0}\frac{(x-\sin x)e^{-x^2}}{\sqrt{1-x^3}-1}=$ ＿＿＿
答案: -1/3
备选: -0.333333333333
解析:
利用等价无穷小：当 $x\to0$ 时，有 $\sqrt{1-x^3}-1\sim-\dfrac{1}{2}x^3$，所以

$$\lim_{x\to0}\frac{(x-\sin x)e^{-x^2}}{\sqrt{1-x^3}-1}=-2\lim_{x\to0}\frac{x-\sin x}{x^3}=-2\lim_{x\to0}\frac{1-\cos x}{3x^2}=-\frac{1}{3}.$$

## 2020 第十二届CMC预赛 非数学类 填空2
类型: 填空
知识点: 高阶导数, 莱布尼茨公式
难度: 3
分值: 5
题目: 设函数 $f(x)=(x+1)^ne^{-x^2}$，则 $f^{(n)}(-1)=$ ＿＿＿
答案: n!/e
备选: \frac{n!}{e}
解析:
利用莱布尼茨求导法则，得

$$f^{(n)}(x)=n!e^{-x^2}+\sum_{k=0}^{n-1}C_n^k[(x+1)^n]^{(k)}(e^{-x^2})^{(n-k)},$$

所以 $f^{(n)}(-1)=\dfrac{n!}{e}$。

## 2020 第十二届CMC预赛 非数学类 填空3
类型: 填空
知识点: 隐函数求导, 切线方程
难度: 3
分值: 5
题目: 设 $y=f(x)$ 是由方程 $\arctan\dfrac{x}{y}=\ln\sqrt{x^2+y^2}-\dfrac{1}{2}\ln2+\dfrac{\pi}{4}$ 确定的隐函数，且满足 $f(1)=1$，则曲线 $y=f(x)$ 在点 $(1,1)$ 处的切线方程为＿＿＿
答案: y=1
备选: y-1=0
解析:
对所给方程两端关于 $x$ 求导，得

$$\frac{\dfrac{y-xy'}{y^2}}{1+\left(\dfrac{x}{y}\right)^2}=\frac{x+yy'}{x^2+y^2},\quad\text{即}\ (x+y)y'=y-x,$$

所以 $f'(1)=0$。曲线 $y=f(x)$ 在点 $(1,1)$ 处的切线方程为 $y=1$。

## 2020 第十二届CMC预赛 非数学类 填空4
类型: 填空
知识点: 反常积分, 二重积分, 分部积分
难度: 5
分值: 5
题目: 已知 $\displaystyle\int_0^{+\infty}\frac{\sin x}{x}dx=\frac{\pi}{2}$，则 $\displaystyle\int_0^{+\infty}\int_0^{+\infty}\frac{\sin x\sin(x+y)}{x(x+y)}dxdy=$ ＿＿＿
答案: pi^2/8
备选: \frac{\pi^2}{8}
解析:
令 $u=x+y$，得

$$I=\int_0^{+\infty}\frac{\sin x}{x}dx\int_0^{+\infty}\frac{\sin(x+y)}{x+y}dy=\int_0^{+\infty}\frac{\sin x}{x}dx\int_x^{+\infty}\frac{\sin u}{u}du$$

$$=\int_0^{+\infty}\frac{\sin x}{x}dx\left(\int_0^{+\infty}\frac{\sin u}{u}du-\int_0^x\frac{\sin u}{u}du\right)$$

$$=\left(\int_0^{+\infty}\frac{\sin x}{x}dx\right)^2-\int_0^{+\infty}\frac{\sin x}{x}dx\int_0^x\frac{\sin u}{u}du.$$

令 $F(x)=\displaystyle\int_0^x\frac{\sin u}{u}du$，则 $F'(x)=\dfrac{\sin x}{x}$，$\displaystyle\lim_{x\to+\infty}F(x)=\frac{\pi}{2}$，所以

$$I=\frac{\pi^2}{4}-\int_0^{+\infty}F(x)F'(x)dx=\frac{\pi^2}{4}-\frac{1}{2}\left[F(x)^2\right]\Big|_0^{+\infty}=\frac{\pi^2}{4}-\frac{1}{2}\left(\frac{\pi}{2}\right)^2=\frac{\pi^2}{8}.$$

## 2020 第十二届CMC预赛 非数学类 填空5
类型: 填空
知识点: 极限, 等价无穷小, 导数定义
难度: 4
分值: 5
题目: 设 $f(x)$，$g(x)$ 在 $x=0$ 的某一邻域 $U$ 内有定义，对任意 $x\in U$，$f(x)\neq g(x)$，且 $\displaystyle\lim_{x\to0}f(x)=\lim_{x\to0}g(x)=a>0$，则 $\displaystyle\lim_{x\to0}\frac{[f(x)]^{f(x)}-[g(x)]^{g(x)}}{f(x)-g(x)}=$ ＿＿＿
答案: a^a
解析:
根据极限的保号性，存在 $x=0$ 的一个去心邻域 $U_1$，使得 $x\in U_1$ 时 $f(x)>0$，$g(x)>0$。当 $x\to0$ 时，有 $e^x-1\sim x$，$\ln(1+x)\sim x$，利用等价无穷小替换，得

$$\lim_{x\to0}\frac{[f(x)]^{f(x)}-[g(x)]^{g(x)}}{f(x)-g(x)}=\lim_{x\to0}[g(x)]^{g(x)}\frac{\left(\dfrac{f(x)}{g(x)}\right)^{g(x)}-1}{f(x)-g(x)}=a^a\lim_{x\to0}\frac{\left(\dfrac{f(x)}{g(x)}\right)^{g(x)}-1}{f(x)-g(x)}$$

$$=a^a\lim_{x\to0}\frac{e^{g(x)\ln\frac{f(x)}{g(x)}}-1}{f(x)-g(x)}=a^a\lim_{x\to0}\frac{g(x)\ln\dfrac{f(x)}{g(x)}}{f(x)-g(x)}=a^a\lim_{x\to0}\frac{g(x)\ln\left(1+\left(\dfrac{f(x)}{g(x)}-1\right)\right)}{f(x)-g(x)}$$

$$=a^a\lim_{x\to0}\frac{g(x)\left(\dfrac{f(x)}{g(x)}-1\right)}{f(x)-g(x)}=a^a.$$

## 2020 第十二届CMC预赛 非数学类 解答二
类型: 解答
知识点: 数列极限, 数学归纳法, 斯特林公式思想
难度: 4
分值: 10
题目: （10 分）设数列 $\{a_n\}$ 满足：$a_1=1$，且 $a_{n+1}=\dfrac{a_n}{(n+1)(a_n+1)}$，$n\geq1$。求极限 $\displaystyle\lim_{n\to\infty}n!a_n$。
答案: 1/e
解析:
利用归纳法易知 $a_n>0$（$n\geq1$）。由于

$$\frac{1}{a_{n+1}}=(n+1)\left(1+\frac{1}{a_n}\right)=(n+1)+(n+1)\frac{1}{a_n}=(n+1)+(n+1)\left(n+(n+1)\frac{1}{a_{n-1}}\right)$$

$$=(n+1)+(n+1)n+(n+1)n\frac{1}{a_{n-1}},$$

如此递推，得

$$\frac{1}{a_{n+1}}=(n+1)!\left(\sum_{k=1}^{n}\frac{1}{k!}+\frac{1}{a_1}\right)=(n+1)!\sum_{k=0}^{n}\frac{1}{k!},$$

因此

$$\lim_{n\to\infty}n!a_n=\frac{1}{\lim\limits_{n\to\infty}\sum\limits_{k=0}^{n}\dfrac{1}{k!}}=\frac{1}{e}.$$

## 2020 第十二届CMC预赛 非数学类 解答三
类型: 解答
知识点: 介值定理, 拉格朗日中值定理
难度: 3
分值: 10
题目: （10 分）设 $f(x)$ 在 $[0,1]$ 上连续，$f(x)$ 在 $(0,1)$ 内可导，且 $f(0)=0$，$f(1)=1$。证明：(1) 存在 $x_0\in(0,1)$ 使得 $f(x_0)=2-3x_0$；(2) 存在 $\xi,\eta\in(0,1)$，且 $\xi\neq\eta$，使得 $[1+f'(\xi)][1+f'(\eta)]=4$。
答案: 见结论：(1) 存在 $x_0\in(0,1)$ 使 $f(x_0)=2-3x_0$；(2) 存在互异的 $\xi,\eta\in(0,1)$ 使 $[1+f'(\xi)][1+f'(\eta)]=4$。分别在 $[0,x_0]$、$[x_0,1]$ 上用拉格朗日中值定理。
解析:
(1) 令 $F(x)=f(x)-2+3x$，则 $F(x)$ 在 $[0,1]$ 上连续，且 $F(0)=-2$，$F(1)=2$。根据连续函数介值定理，存在 $x_0\in(0,1)$ 使得 $F(x_0)=0$，即 $f(x_0)=2-3x_0$。

(2) 在区间 $[0,x_0]$，$[x_0,1]$ 上利用拉格朗日中值定理，存在 $\xi,\eta\in(0,1)$，且 $\xi\neq\eta$，使得

$$\frac{f(x_0)-f(0)}{x_0-0}=f'(\xi),\qquad\text{且}\quad\frac{f(x_0)-f(1)}{x_0-1}=f'(\eta).$$

所以

$$[1+f'(\xi)][1+f'(\eta)]=4.$$

## 2020 第十二届CMC预赛 非数学类 解答四
类型: 解答
知识点: 多元复合函数求导, 二阶偏导数, 常微分方程
难度: 5
分值: 12
题目: （12 分）已知 $z=xf\left(\dfrac{y}{x}\right)+2y\varphi\left(\dfrac{x}{y}\right)$，其中 $f$，$\varphi$ 均为二次可微函数。(1) 求 $\dfrac{\partial z}{\partial x}$，$\dfrac{\partial^2 z}{\partial x\partial y}$；(2) 当 $f=\varphi$，且 $\dfrac{\partial^2 z}{\partial x\partial y}\bigg|_{x=a}=-by^2$ 时，求 $f(y)$。
答案: $f(y)=\dfrac{a^3b}{3}\left(\dfrac{1}{3y^2}-\dfrac{y^3}{6}\right)+C_1y+C_2$
解析:
(1)

$$\frac{\partial z}{\partial x}=f\left(\frac{y}{x}\right)-\frac{y}{x}f'\left(\frac{y}{x}\right)+2\varphi'\left(\frac{x}{y}\right),\qquad \frac{\partial^2 z}{\partial x\partial y}=-\frac{y}{x^2}f''\left(\frac{y}{x}\right)-\frac{2x}{y^2}\varphi''\left(\frac{x}{y}\right).$$

(2)

$$\frac{\partial^2 z}{\partial x\partial y}\bigg|_{x=a}=-\frac{y}{a^2}f''\left(\frac{y}{a}\right)-\frac{2a}{y^2}\varphi''\left(\frac{a}{y}\right)=-by^2.$$

因为 $f=\varphi$，所以

$$\frac{y}{a^2}f''\left(\frac{y}{a}\right)+\frac{2a}{y^2}f''\left(\frac{a}{y}\right)=by^2.$$

令 $y=au$，则 $\dfrac{u}{a}f''(u)+\dfrac{2}{au^2}f''\left(\dfrac{1}{u}\right)=a^2bu^2$，即

$$u^3f''(u)+2f''\left(\frac{1}{u}\right)=a^3bu^4.$$

上式中以 $\dfrac{1}{u}$ 换 $u$ 得

$$2f''\left(\frac{1}{u}\right)+4u^3f''(u)=2a^3b\frac{1}{u}.$$

联立二式，解得 $-3u^3f''(u)=a^3b\left(u^4-\dfrac{2}{u}\right)$，所以 $f''(u)=\dfrac{a^3b}{3}\left(\dfrac{2}{u^4}-u\right)$，从而有

$$f(u)=\frac{a^3b}{3}\left(\frac{1}{3u^2}-\frac{u^3}{6}\right)+C_1u+C_2.$$

故 $f(y)=\dfrac{a^3b}{3}\left(\dfrac{1}{3y^2}-\dfrac{y^3}{6}\right)+C_1y+C_2$。

## 2020 第十二届CMC预赛 非数学类 解答五
类型: 解答
知识点: 第二型曲线积分, 参数方程, 周期函数积分性质, 奇偶性
难度: 5
分值: 12
题目: （12 分）计算 $I=\displaystyle\oint_{\Gamma}\left|\sqrt{3}y-x\right|dx-5zdz$，曲线 $\Gamma:\begin{cases}x^2+y^2+z^2=8\\ x^2+y^2=2z\end{cases}$，从 $z$ 轴正向往坐标原点看去取逆时针方向。
答案: $0$
解析:
曲线 $\Gamma$ 也可表示为 $\begin{cases}z=2\\ x^2+y^2=4\end{cases}$，所以 $\Gamma$ 的参数方程为 $x=2\cos\theta$，$y=2\sin\theta$，$z=2$，参数的范围：$0\leq\theta\leq2\pi$。

注意到在曲线 $\Gamma$ 上 $dz=0$，所以

$$I=-\int_0^{2\pi}\left|2\sqrt{3}\sin\theta-2\cos\theta\right|2\sin\theta d\theta=-8\int_0^{2\pi}\left|\frac{\sqrt{3}}{2}\sin\theta-\frac{1}{2}\cos\theta\right|\sin\theta d\theta$$

$$=-8\int_0^{2\pi}\left|\cos\left(\theta+\frac{\pi}{3}\right)\right|\sin\theta d\theta=-8\int_{\frac{\pi}{3}}^{2\pi+\frac{\pi}{3}}\left|\cos t\right|\sin\left(t-\frac{\pi}{3}\right)dt,\ (\text{代换：}\ t=\theta+\tfrac{\pi}{3}).$$

根据周期函数的积分性质，得

$$I=-8\int_{-\pi}^{\pi}\left|\cos t\right|\sin\left(t-\frac{\pi}{3}\right)dt=-4\int_{-\pi}^{\pi}\left|\cos t\right|\left(\sin t-\sqrt{3}\cos t\right)dt=8\sqrt{3}\int_0^{\pi}\left|\cos t\right|\cos t\,dt.$$

令 $u=t-\dfrac{\pi}{2}$，则 $I=-8\sqrt{3}\displaystyle\int_{-\frac{\pi}{2}}^{\frac{\pi}{2}}\left|\sin u\right|\sin u\,du=0$。

## 2020 第十二届CMC预赛 非数学类 解答六
类型: 解答
知识点: 定积分, 三角恒等式, 因子求和
难度: 5
分值: 12
题目: （12 分）证明 $f(n)=\displaystyle\sum_{m=1}^{\infty}\int_0^m\cos\frac{2\pi n[x+1]}{m}dx$ 等于 $n$ 的所有因子（包括 1 和 $n$ 本身）之和，其中 $[x+1]$ 表示不超过 $x+1$ 的最大整数，并计算 $f(2021)$。
答案: $f(2021)=1+43+47+2021=2112$
解析:
$$\int_0^m\cos\frac{2\pi n[x+1]}{m}dx=\sum_{k=1}^m\int_{k-1}^k\cos\frac{2\pi n[x+1]}{m}dx=\sum_{k=1}^m\int_{k-1}^k\cos\frac{2\pi nk}{m}dx=\sum_{k=1}^m\cos\frac{2\pi nk}{m}.$$

如果 $m$ 是 $n$ 的因子，那么 $\displaystyle\int_0^m\cos\frac{2\pi n[x+1]}{m}dx=m$；否则，根据三角恒等式

$$\sum_{k=1}^m\cos kt=\cos\frac{m+1}{2}t\cdot\frac{\sin\dfrac{mt}{2}}{\sin\dfrac{t}{2}},$$

有

$$\int_0^m\cos\frac{2\pi n[x+1]}{m}dx=\cos\left(\frac{m+1}{2}\cdot\frac{2\pi n}{m}\right)\cdot\frac{\sin\left(\dfrac{m}{2}\cdot\dfrac{2\pi n}{m}\right)}{\sin\dfrac{2\pi n}{2m}}=0.$$

因此得证。

由此可得 $f(2021)=1+43+47+2021=2112$。

## 2020 第十二届CMC预赛 非数学类 解答七
类型: 解答
知识点: 数列收敛, 莱布尼茨判别法, 比较判别法, 幂级数求和
难度: 5
分值: 14
题目: （14 分）设 $u_n=\displaystyle\int_0^1\frac{dt}{(1+t^4)^n}$（$n\geq1$）。(1) 证明数列 $\{u_n\}$ 收敛，并求极限 $\displaystyle\lim_{n\to\infty}u_n$；(2) 证明级数 $\displaystyle\sum_{n=1}^{\infty}(-1)^nu_n$ 条件收敛；(3) 证明当 $p\geq1$ 时级数 $\displaystyle\sum_{n=1}^{\infty}\frac{u_n}{n^p}$ 收敛，并求级数 $\displaystyle\sum_{n=1}^{\infty}\frac{u_n}{n}$ 的和。
答案: $\lim u_n=0$；$\sum(-1)^nu_n$ 条件收敛；$\displaystyle\sum_{n=1}^{\infty}\frac{u_n}{n}=\ln2+\frac{\sqrt{2}}{2}\left[\pi+2\ln(1+\sqrt{2})\right]$
解析:
(1) 对任意 $\varepsilon>0$，取 $0<a<\dfrac{\varepsilon}{2}$，将积分区间分成两段，得

$$u_n=\int_0^1\frac{dt}{(1+t^4)^n}=\int_0^a\frac{dt}{(1+t^4)^n}+\int_a^1\frac{dt}{(1+t^4)^n}.$$

因为

$$\int_a^1\frac{dt}{(1+t^4)^n}\leq\frac{1-a}{(1+a^4)^n}<\frac{1}{(1+a^4)^n}\to0\quad(n\to\infty)$$

所以存在正整数 $N$，当 $n>N$ 时，$\displaystyle\int_a^1\frac{dt}{(1+t^4)^n}<\frac{\varepsilon}{2}$，从而

$$0\leq u_n<a+\int_a^1\frac{dt}{(1+t^4)^n}<\frac{\varepsilon}{2}+\frac{\varepsilon}{2}=\varepsilon.$$

所以 $\displaystyle\lim_{n\to\infty}u_n=0$。

(2) 显然 $0<u_{n+1}=\displaystyle\int_0^1\frac{dt}{(1+t^4)^{n+1}}\leq\int_0^1\frac{dt}{(1+t^4)^n}=u_n$，即 $u_n$ 单调递减，又 $\displaystyle\lim_{n\to\infty}u_n=0$，故由莱布尼兹判别法知，$\displaystyle\sum_{n=1}^{\infty}(-1)^nu_n$ 收敛。

另一方面，当 $n\geq2$ 时，有

$$u_n=\int_0^1\frac{dt}{(1+t^4)^n}\geq\int_0^1\frac{dt}{(1+t^2)^n}=\frac{1}{n-1}\left(1-2^{1-\frac{n}{2}}\right),$$

由于 $\displaystyle\sum_{n=2}^{\infty}\frac{1}{n-1}$ 发散，$\displaystyle\sum_{n=2}^{\infty}\frac{1}{n-1}\cdot\frac{1}{2^{\frac{n}{2}-1}}$ 收敛，所以 $\displaystyle\sum_{n=2}^{\infty}\frac{1}{n-1}\left(1-2^{1-\frac{n}{2}}\right)$ 发散，从而 $\displaystyle\sum_{n=1}^{\infty}u_n$ 发散。因此 $\displaystyle\sum_{n=1}^{\infty}(-1)^nu_n$ 条件收敛。

(3) 先求级数 $\displaystyle\sum_{n=1}^{\infty}\frac{u_n}{n}$ 的和。因为

$$u_n=\int_0^1\frac{dt}{(1+t^4)^n}=\left.\frac{t}{(1+t^4)^n}\right|_0^1+n\int_0^1\frac{4t^4}{(1+t^4)^{n+1}}dt=\frac{1}{2^n}+4n\int_0^1\frac{t^4}{(1+t^4)^{n+1}}dt$$

$$=\frac{1}{2^n}+4n(u_n-u_{n+1}),$$

所以

$$\sum_{n=1}^{\infty}\frac{u_n}{n}=\sum_{n=1}^{\infty}\frac{1}{n2^n}+4\sum_{n=1}^{\infty}(u_n-u_{n+1})=\sum_{n=1}^{\infty}\frac{1}{n2^n}+4u_1.$$

利用展开式 $\ln(1+x)=\displaystyle\sum_{n=1}^{\infty}(-1)^{n-1}\frac{x^n}{n}$，取 $x=-\dfrac{1}{2}$，得 $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n2^n}=\ln2$。而

$$u_1=\int_0^1\frac{dt}{1+t^4}=\frac{\sqrt{2}}{8}\left[\pi+2\ln(1+\sqrt{2})\right],$$

因此

$$\sum_{n=1}^{\infty}\frac{u_n}{n}=\ln2+\frac{\sqrt{2}}{2}\left[\pi+2\ln(1+\sqrt{2})\right].$$

最后，当 $p\geq1$ 时，因为 $\dfrac{u_n}{n^p}\leq\dfrac{u_n}{n}$，且 $\displaystyle\sum_{n=1}^{\infty}\frac{u_n}{n}$ 收敛，所以 $\displaystyle\sum_{n=1}^{\infty}\frac{u_n}{n^p}$ 收敛。
