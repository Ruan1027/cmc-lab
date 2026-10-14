## 2022 第十四届CMC预赛 非数学类 填空1
类型: 填空
知识点: 极限, 洛必达法则
难度: 2
分值: 5
题目: 极限 $\displaystyle\lim_{x\to0}\frac{1-\sqrt{1-x^2}\cos x}{1+x^2-\cos^2x}=$ ＿＿＿
答案: 1/2
备选: 0.5
解析:
利用洛必达法则，得

$$\text{原式}=\lim_{x\to0}\frac{\sqrt{1-x^2}\sin x+\frac{x\cos x}{\sqrt{1-x^2}}}{2x+2\cos x\sin x}=\lim_{x\to0}\frac{\sqrt{1-x^2}\cdot\frac{\sin x}{x}+\frac{\cos x}{\sqrt{1-x^2}}}{2+2\frac{\sin x}{x}\cos x}=\frac{1}{2}.$$

## 2022 第十四届CMC预赛 非数学类 填空2
类型: 填空
知识点: 复合函数, 间断点
难度: 2
分值: 5
题目: 设 $f(x)=\begin{cases}1,&x>0\\ 0,&x\leq0\end{cases}$，$g(x)=\begin{cases}x-1,&x\geq1\\ 1-x,&x<1\end{cases}$，则复合函数 $f\left[g(x)\right]$ 的间断点为 $x=$ ＿＿＿
答案: 1
解析:
显然，复合函数 $f\left[g(x)\right]=\begin{cases}1,&g(x)>0\\ 0,&g(x)\leq0\end{cases}=\begin{cases}1,&x\neq1\\ 0,&x=1\end{cases}$，所以 $f\left[g(x)\right]$ 的惟一间断点为 $x=1$。

## 2022 第十四届CMC预赛 非数学类 填空3
类型: 填空
知识点: 幂级数求和, 极限
难度: 3
分值: 5
题目: 极限 $\displaystyle\lim_{x\to1^-}(1-x)^3\sum_{n=1}^{\infty}n^2x^n=$ ＿＿＿
答案: 2
解析:
易知，$\displaystyle\sum_{n=1}^{\infty}n^2x^n$ 的和函数为：$\displaystyle\sum_{n=1}^{\infty}n^2x^n=\frac{x^2+x}{(1-x)^3}$，$|x|<1$，所以

$$\lim_{x\to1^-}(1-x)^3\sum_{n=1}^{\infty}n^2x^n=\lim_{x\to1^-}(x^2+x)=2.$$

## 2022 第十四届CMC预赛 非数学类 填空4
类型: 填空
知识点: 一阶微分方程, 伯努利方程, 变量代换
难度: 4
分值: 5
题目: 微分方程 $\dfrac{dy}{dx}x\ln x\sin y+\cos y(1-x\cos y)=0$ 的通解为＿＿＿
答案: (x+C)*cos(y)=ln(x)
解析:
原方程等价于 $\dfrac{dy}{dx}\sin y+\dfrac{1}{x\ln x}\cos y=\dfrac{1}{\ln x}\cos^2y$。令 $u=\cos y$，则方程可化为 $\dfrac{du}{dx}-\dfrac{1}{x\ln x}u=-\dfrac{1}{\ln x}u^2$。再令 $w=\dfrac{1}{u}$，则方程可进一步化为 $\dfrac{dw}{dx}+\dfrac{1}{x\ln x}w=\dfrac{1}{\ln x}$。

这是一阶线性微分方程，利用求解公式得

$$w=e^{-\int\frac{dx}{x\ln x}}\left(\int\frac{1}{\ln x}e^{\int\frac{dx}{x\ln x}}dx+C\right)=\frac{1}{\ln x}(x+C).$$

将变量 $w=\dfrac{1}{u}=\dfrac{1}{\cos y}$ 代回，得

$$(x+C)\cos y=\ln x.$$

## 2022 第十四届CMC预赛 非数学类 填空5
类型: 填空
知识点: 二重积分, 换元法, 三角公式
难度: 3
分值: 5
题目: 记 $D=\left\{(x,y)\,\middle|\,0\leq x+y\leq\pi,0\leq x-y\leq\dfrac{\pi}{2}\right\}$，则 $\displaystyle\iint_D y\sin(x+y)dxdy=$ ＿＿＿
答案: pi/8-pi^2/32
备选: \frac{\pi}{8}-\frac{\pi^2}{32}
解析:
（方法 1）利用三角公式：$\sin(x+y)=\sin x\cos y+\cos x\sin y$，并根据重积分的对称性，得

$$\text{原式}=2\int_0^{\frac{\pi}{2}}y\sin y\,dy\int_{\frac{\pi}{2}-y}^{\pi-y}\cos x\,dx=2\int_0^{\frac{\pi}{4}}y\sin y(\cos y-\sin y)dy$$

$$=\int_0^{\frac{\pi}{4}}y\sin2y\,dy+\int_0^{\frac{\pi}{4}}y\cos2y\,dy-\int_0^{\frac{\pi}{4}}y\,dy$$

$$=\frac{1}{4}+\left(\frac{\pi}{8}-\frac{1}{4}\right)-\frac{\pi^2}{32}=\frac{\pi}{8}-\frac{\pi^2}{32}.$$

（方法 2）利用二元变量代换，令 $\begin{cases}u=x+y\\ v=x-y\end{cases}$，则 $\begin{cases}x=\dfrac{1}{2}(u+v)\\ y=\dfrac{1}{2}(u-v)\end{cases}$。因为

$$J=\begin{vmatrix}\dfrac{\partial x}{\partial u}&\dfrac{\partial x}{\partial v}\\ \dfrac{\partial y}{\partial u}&\dfrac{\partial y}{\partial v}\end{vmatrix}=\begin{vmatrix}\dfrac{1}{2}&\dfrac{1}{2}\\ \dfrac{1}{2}&-\dfrac{1}{2}\end{vmatrix}=-\frac{1}{2},$$

所以

$$\text{原式}=|J|\int_0^{\pi}\int_0^{\frac{\pi}{2}}\frac{1}{2}(u-v)\sin u\,dudv=\frac{1}{4}\int_0^{\frac{\pi}{2}}dv\int_0^{\frac{\pi}{2}}u\sin u\,du-\frac{1}{4}\int_0^{\pi}dv\int_0^{\frac{\pi}{2}}\sin u\,du$$

$$=\frac{1}{4}\times\frac{\pi}{2}\times1-\frac{1}{4}\times\frac{\pi^2}{8}\times1=\frac{\pi}{8}-\frac{\pi^2}{32}.$$

## 2022 第十四届CMC预赛 非数学类 解答二
类型: 解答
知识点: 向量运算, 二次函数最值, 反函数, 单调性
难度: 4
分值: 14
题目: （本题满分 14 分）记向量 $\overrightarrow{OA}$ 与 $\overrightarrow{OB}$ 的夹角为 $\alpha$，$|\overrightarrow{OA}|=1$，$|\overrightarrow{OB}|=2$，$\overrightarrow{OP}=(1-\lambda)\overrightarrow{OA}$，$\overrightarrow{OQ}=\lambda\overrightarrow{OB}$，$0\leq\lambda\leq1$。(1) 问当 $\lambda$ 为何值时，$|\overrightarrow{PQ}|$ 取得最小值；(2) 设 (1) 中的 $\lambda$ 满足 $0<\lambda\leq\dfrac{1}{3}$，求夹角 $\alpha$ 的取值范围。
答案: (1) $\lambda=\dfrac{1+2\cos\alpha}{5+4\cos\alpha}$；(2) $\alpha\in\left(\dfrac{\pi}{2},\dfrac{2\pi}{3}\right)$
解析:
(1) 根据余弦定理，并注意到 $0\leq\alpha\leq\pi$，得

$$f(\lambda)=\left|\overrightarrow{PQ}\right|^2=(1-\lambda)^2+4\lambda^2-4\lambda(1-\lambda)\cos\alpha$$

$$=(5+4\cos\alpha)\lambda^2-2(1+2\cos\alpha)\lambda+1$$

$$=(5+4\cos\alpha)\left(\lambda-\frac{1+2\cos\alpha}{5+4\cos\alpha}\right)^2+1-\frac{(1+2\cos\alpha)^2}{5+4\cos\alpha},$$

因此，当 $\lambda=\dfrac{1+2\cos\alpha}{5+4\cos\alpha}$，$0\leq\lambda\leq1$，$\left|\overrightarrow{PQ}\right|$ 取得最小值。（6分）

(2) 令 $y=\cos\alpha$，则 $\lambda=\dfrac{1+2y}{5+4y}$ 的反函数为 $g(\lambda)=-\dfrac{1}{2}\cdot\dfrac{5\lambda-1}{2\lambda-1}$。易知 $g(\lambda)$ 在 $\left(0,\dfrac{1}{5}\right]$ 单调增加，其值域为 $\left(-\dfrac{1}{2},0\right]$，所以 $-\dfrac{1}{2}<\cos\alpha<0$，注意到 $\cos\alpha$ 在 $[0,\pi]$ 上单调递减，解得 $\dfrac{\pi}{2}<\alpha<\dfrac{2\pi}{3}$，即夹角 $\alpha$ 的取值范围为 $\left(\dfrac{\pi}{2},\dfrac{2\pi}{3}\right)$。（8分）

## 2022 第十四届CMC预赛 非数学类 解答三
类型: 解答
知识点: 拉格朗日中值定理, 构造辅助函数, 单调性
难度: 5
分值: 14
题目: （本题满分 14 分）设函数 $f(x)$ 在 $(-1,1)$ 上二阶可导，$f(0)=1$，且当 $x\geq0$ 时，$f(x)\geq0$，$f'(x)\leq0$，$f''(x)\leq f(x)$。证明：$f'(0)\geq-\sqrt{2}$。
答案: 见结论：$f'(0)\ge-\sqrt2$。令 $F(x)=[f'(x)]^2-[f(x)]^2$，由 $f'\le0$、$f''\le f$ 得 $F'(x)\ge0$，取 $x\to1^-$ 得 $[f'(0)]^2\le2$。
解析:
任取 $x\in(0,1)$，对 $f(x)$ 在 $[0,x]$ 上利用 Lagrange 中值定理，存在 $\xi\in(0,1)$，使得 $f(x)-f(0)=xf'(\xi)$。因为 $f(0)=1$，$f(x)\geq0$（$x>0$），所以

$$-\frac{1}{x}\leq f'(\xi)\leq0.\tag{5分}$$

令 $F(x)=\left[f'(x)\right]^2-\left[f(x)\right]^2$，则 $F(x)$ 在 $(0,1)$ 内可导，且

$$F'(x)=2f'(x)\left[f''(x)-f(x)\right].$$

根据题设条件，当 $x\geq0$ 时，$f'(x)\leq0$，$f''(x)\leq f(x)$，所以 $F'(x)\geq0$。这表明 $F(x)$ 在 $[0,1)$ 上单调增加，从而有 $F(\xi)\geq F(0)$，可得

$$\left[f'(\xi)\right]^2-\left[f(\xi)\right]^2\geq\left[f(\xi)\right]^2-\left[f(0)\right]^2\geq-1,$$

因此 $\left[f'(0)\right]^2\leq\left[f'(\xi)\right]^2+1\leq1+\dfrac{1}{x^2}$。（7分）

由于 $\displaystyle\lim_{x\to1^-}\left(1+\frac{1}{x^2}\right)=2$，所以 $\left[f'(0)\right]^2\leq2$，从而有 $f'(0)\geq-\sqrt{2}$。（2分）

## 2022 第十四届CMC预赛 非数学类 解答四
类型: 解答
知识点: 积分不等式, 归纳法, 分段估计
难度: 5
分值: 14
题目: （本题满分 14 分）证明：对任意正整数 $n$，恒有 $\displaystyle\int_0^{\frac{\pi}{2}}x\left(\frac{\sin nx}{\sin x}\right)^4dx\leq\left(\frac{n^2}{4}-\frac{1}{8}\right)\pi^2$。
答案: 见结论：$\displaystyle\int_0^{\pi/2}x\left(\frac{\sin nx}{\sin x}\right)^4dx\le\left(\frac{n^2}{4}-\frac18\right)\pi^2$。用 $\sin^4x\le\left(\frac{\sin2x}{2x/\pi}\right)^4$ 化归为幂函数积分；$n=1$ 时等号成立。
解析:
首先，利用归纳法易证：对 $n\geq1$，$|\sin nx|\leq n\sin x$（$0\leq x\leq\dfrac{\pi}{2}$）。（2分）

又由于 $|\sin nx|\leq1$，及 $\sin x\geq\dfrac{2}{\pi}x$（$0\leq x\leq\dfrac{\pi}{2}$），（2分）

所以当 $n>1$ 时，得

$$\int_0^{\frac{\pi}{2}}x\left(\frac{\sin nx}{\sin x}\right)^4dx=\int_0^{\frac{\pi}{2n}}x\left(\frac{\sin nx}{\sin x}\right)^4dx+\int_{\frac{\pi}{2n}}^{\frac{\pi}{2}}x\left(\frac{\sin nx}{\sin x}\right)^4dx$$

$$\leq n^4\int_0^{\frac{\pi}{2n}}xdx+\int_{\frac{\pi}{2n}}^{\frac{\pi}{2}}x\left(\frac{1}{2x/\pi}\right)^4dx=\frac{n^4}{2}\left(\frac{\pi}{2n}\right)^2+\frac{\pi^4}{16}\int_{\frac{\pi}{2n}}^{\frac{\pi}{2}}\frac{dx}{x^3}$$

$$=\frac{n^2\pi^2}{8}+\frac{\pi^4}{16}\cdot\frac{1}{(-2x^2)}\bigg|_{\frac{\pi}{2n}}^{\frac{\pi}{2}}=\frac{n^2\pi^2}{8}-\frac{\pi^4}{16}\left(\frac{2}{\pi^2}-\frac{2n^2}{\pi^2}\right)=\left(\frac{n^2}{4}-\frac{1}{8}\right)\pi^2.$$（8分）

当 $n=1$ 时，$\displaystyle\int_0^{\frac{\pi}{2}}xdx=\frac{\pi^2}{8}$，等号成立。（2分）

## 2022 第十四届CMC预赛 非数学类 解答五
类型: 解答
知识点: 累次积分, 交换积分次序, 全微分, 夹逼准则
难度: 5
分值: 14
题目: （本题满分 14 分）设 $z=f(x,y)$ 是区域 $D=\{(x,y)\,|\,0\leq x\leq1,0\leq y\leq1\}$ 上的可微函数，$f(0,0)=0$，且 $dz\big|_{(0,0)}=3dx+2dy$，求极限 $\displaystyle\lim_{x\to0^+}\frac{\displaystyle\int_0^{x^2}dt\int_x^{\sqrt{t}}f(t,u)du}{1-\sqrt[4]{1-x^4}}$。
答案: $-2$
解析:
交换二次积分的次序，得 $\displaystyle\int_0^{x^2}dt\int_x^{\sqrt{t}}f(t,u)du=-\int_0^xdu\int_{u^2}^{x^2}f(t,u)dt.$（3分）

由于 $f(x,y)$ 在 $D$ 上可微，所以 $f(x,y)$ 在点 $(0,0)$ 的半径为 1 的扇形域内连续，从而 $\varphi(u)=\displaystyle\int_{u^2}^{x^2}f(t,u)dt$ 在 $u=0$ 的某邻域内连续，因此

$$I=\lim_{x\to0^+}\frac{\displaystyle\int_0^{x^2}dt\int_x^{\sqrt{t}}f(t,u)du}{1-\sqrt[4]{1-x^4}}=\lim_{x\to0^+}\frac{-\displaystyle\int_0^x\varphi(u)du}{\dfrac{x^4}{4}}=-\lim_{x\to0^+}\frac{\varphi(x)}{x^3}=-\lim_{x\to0^+}\frac{\displaystyle\int_0^{x^2}f(t,x)dt}{x^3}$$

$$=-\lim_{x\to0^+}\frac{f(\xi,x)x^2}{x^3}=-\lim_{x\to0^+}\frac{f(\xi,x)}{x},\quad 0<\xi<x^2.（6分）$$

因为 $dz\big|_{(0,0)}=3dx+2dy$，所以 $f_x(0,0)=3$，$f_y(0,0)=2$。又 $f(0,0)=0$，于是

$$f(\xi,x)=f(0,0)+f_x(0,0)\xi+f_y(0,0)x+o\left(\sqrt{\xi^2+x^2}\right)=3\xi+2x+o\left(\sqrt{\xi^2+x^2}\right).$$

注意到 $0<\dfrac{\xi}{x}<1$，故由夹逼准则知 $\displaystyle\lim_{x\to0^+}\frac{\xi}{x}=0$，从而

$$\lim_{x\to0^+}\frac{o\left(\sqrt{\xi^2+x^2}\right)}{x}=\lim_{x\to0^+}\frac{o\left(\sqrt{\xi^2+x^2}\right)}{\sqrt{\xi^2+x^2}}\cdot\sqrt{1+\left(\frac{\xi}{x}\right)^2}=0.$$

所以

$$I=-\lim_{x\to0^+}\frac{f(\xi,x)}{x}=-\lim_{x\to0^+}\frac{3\xi+2x+o\left(\sqrt{\xi^2+x^2}\right)}{x}=-2.$$（5分）

## 2022 第十四届CMC预赛 非数学类 解答六
类型: 解答
知识点: 正项级数, 级数构造, 比较法
难度: 5
分值: 14
题目: （本题满分 14 分）设正项级数 $\displaystyle\sum_{n=1}^{\infty}a_n$ 收敛，证明：存在收敛的正项级数 $\displaystyle\sum_{n=1}^{\infty}b_n$，使得 $\displaystyle\lim_{n\to\infty}\frac{a_n}{b_n}=0$。
答案: 见结论：存在收敛正项级数 $\sum b_n$ 使 $\displaystyle\lim_{n\to\infty}\frac{a_n}{b_n}=0$。取子列 $n_k$ 使 $\sum_{n=n_k}^{n_{k+1}-1}a_n<3^{-k}$，令 $b_n=2^ka_n$，则 $\sum b_n<\sum_{n<n_1}a_n+\sum_{k\ge1}(2/3)^k<+\infty$ 且 $a_n/b_n=2^{-k}\to0$。
解析:
因为 $\displaystyle\sum_{n=1}^{\infty}a_n$ 收敛，所以 $\forall\varepsilon>0$，存在 $N\in\mathbf{N}$，使得当 $n>N$ 时，$\displaystyle\sum_{i=n}^{\infty}a_i<\varepsilon$。

特别，对 $k=1,2,\cdots$，取 $\varepsilon=\dfrac{1}{3^k}$，则存在 $1<n_1<n_2<\cdots<n_{k-1}<n_k$，使得 $\displaystyle\sum_{i=n_k}^{\infty}a_i<\frac{1}{3^k}.$（4分）

构造 $\{b_n\}$ 如下：当 $1\leq n<n_1$ 时，$b_n=a_n$；当 $n_k\leq n<n_{k+1}$ 时，$b_n=2^ka_n$，$k=1,2,\cdots.$（5分）

显然，当 $n\to\infty$ 时，$k\to\infty$，且

$$\lim_{n\to\infty}\frac{a_n}{b_n}=\lim_{k\to\infty}\frac{a_n}{2^ka_n}=\lim_{k\to\infty}\frac{1}{2^k}=0.$$

此时，有

$$\sum_{n=1}^{\infty}b_n=\sum_{n=1}^{n_1-1}a_n+\sum_{n=n_1}^{n_2-1}2a_n+\sum_{n=n_2}^{n_3-1}2^2a_n+\cdots$$

$$\leq\sum_{n=1}^{n_1-1}a_n+2\cdot\frac{1}{3}+2^2\cdot\left(\frac{1}{3}\right)^2+\cdots$$

$$=\sum_{n=1}^{n_1-1}a_n+\sum_{k=1}^{\infty}\frac{2^k}{3^k}<+\infty$$

因此，正项级数 $\displaystyle\sum_{n=1}^{\infty}b_n$ 收敛。（5分）
