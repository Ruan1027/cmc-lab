## 2025 第十七届CMC预赛 非数学A类 填空1
类型: 填空
知识点: 泰勒公式, 极限
难度: 2
分值: 5
题目: 设函数 $f(x)=x-\ln(1+x)-\dfrac{1}{2}x\sin x$，$g(x)=ax^3$，且满足 $\displaystyle\lim_{x\to0}\frac{f(x)}{g(x)}=1$，则 $a=$ ＿＿＿
答案: -1/3
备选: -0.333333333333
解析:
根据 Taylor 公式，$\ln(1+x)=x-\dfrac{x^2}{2}+\dfrac{x^3}{3}+o(x^3)$，$\sin x=x-\dfrac{x^3}{6}+o(x^3)$，所以

$$f(x)=-\frac{1}{3}x^3+o(x^3).$$

因为 $\displaystyle\lim_{x\to0}\frac{f(x)}{g(x)}=1$，即

$$\lim_{x\to0}\frac{-\dfrac{1}{3}x^3+o(x^3)}{ax^3}=1,$$

所以 $a=-\dfrac{1}{3}$。

## 2025 第十七届CMC预赛 非数学A类 填空2
类型: 填空
知识点: 平面方程, 法向量
难度: 2
分值: 5
题目: 设平面过原点与点 $(6,-3,2)$，且与平面 $4x-y+2z-8=0$ 垂直，则此平面方程为＿＿＿
答案: 2x+2y-3z=0
解析:
易得此平面方程为 $2x+2y-3z=0$。

注：答案不唯一，系数差个倍数都对，例如：$-2x-2y+3z=0$ 或 $x+y-\dfrac{3}{2}z=0$ 也对。

## 2025 第十七届CMC预赛 非数学A类 填空3
类型: 填空
知识点: 极限, 变限积分, 等价无穷小, 洛必达法则
难度: 3
分值: 5
题目: 极限 $\displaystyle\lim_{x\to0}\frac{\displaystyle\int_0^{\sin^2x}\ln(1+t)dt}{\left(\sqrt[3]{1+x^3}-1\right)\sin x}=$ ＿＿＿
答案: 3/2
备选: 1.5
解析:
$$\lim_{x\to0}\frac{\displaystyle\int_0^{\sin^2x}\ln(1+t)dt}{\left(\sqrt[3]{1+x^3}-1\right)\sin x}=\lim_{x\to0}\frac{\displaystyle\int_0^{\sin^2x}\ln(1+t)dt}{\dfrac{1}{3}x^4}$$

$$=\lim_{x\to0}\frac{\ln(1+\sin^2x)\cdot2\sin x\cos x}{\dfrac{4}{3}x^3}=\frac{3}{2}.$$

## 2025 第十七届CMC预赛 非数学A类 填空4
类型: 填空
知识点: 隐函数求导, 多元复合函数
难度: 4
分值: 5
题目: 设函数 $f(u,v)$ 具有一阶连续偏导数，$f(2,0)=3$，$f'_u(2,0)=5$，又设 $z=z(x,y)$ 是由方程 $xz=f(2x-y,xyz)$ 确定的隐函数，则 $\left.\dfrac{\partial z}{\partial x}\right|_{\substack{x=1\\ y=0}}=$ ＿＿＿
答案: 7
解析:
对方程两边关于 $x$ 求导数，得

$$z+x\frac{\partial z}{\partial x}=2f'_u+yf'_v\left(z+x\frac{\partial z}{\partial x}\right).$$

由此解得

$$\frac{\partial z}{\partial x}=\frac{1}{x}\left(\frac{2f'_u}{1-yf'_v}-z\right).$$

注意到 $x=1,y=0$ 时，$z=f(2,0)=3$，$f'_u(2,0)=5$，所以

$$\left.\frac{\partial z}{\partial x}\right|_{\substack{x=1\\ y=0}}=2f'_u(2,0)-3=7.$$

## 2025 第十七届CMC预赛 非数学A类 填空5
类型: 填空
知识点: 第一型曲线积分, 对称性
难度: 4
分值: 5
题目: 设曲线 $L$ 为球面 $x^2+y^2+z^2=4$ 与平面 $x+y+z=3$ 的交线，则曲线积分 $\displaystyle\int_L\left(x^2+2xy\right)ds=$ ＿＿＿
答案: 6*pi
解析:
根据对称性，得

$$\int_L\left(x^2+2xy\right)ds=\frac{1}{3}\int_L\left(x^2+y^2+z^2\right)ds+\frac{2}{3}\int_L\left(xy+yz+zx\right)ds$$

$$=\frac{1}{3}\int_L\left(x^2+y^2+z^2\right)ds+\frac{1}{3}\int_L\left((x+y+z)^2-\left(x^2+y^2+z^2\right)\right)ds$$

$$=\frac{1}{3}\int_L(x+y+z)^2ds=6\pi.$$

## 2025 第十七届CMC预赛 非数学A类 解答二
类型: 解答
知识点: 积分方程, 导数定义, 定积分
难度: 4
分值: 14
题目: （本题 14 分）设 $f(x)$ 在 $(-\infty,+\infty)$ 上连续，在 $x=0$ 处可导，且满足 $f(x)=x^3+x^2\displaystyle\lim_{x\to0}\frac{f(x)}{x}-x\int_0^1f(x)dx$。求函数 $f(x)$ 的表达式。
答案: $f(x)=x^3-\dfrac{3}{22}x^2-\dfrac{3}{22}x$
解析:
易知 $f(0)=0$，所以 $\displaystyle\lim_{x\to0}\frac{f(x)}{x}=\lim_{x\to0}\frac{f(x)-f(0)}{x-0}=f'(0)$。

记 $a=f'(0),b=\displaystyle\int_0^1f(x)dx$，则

$$f(x)=x^3+ax^2-bx.\tag{1}$$

由此得 $a=\displaystyle\lim_{x\to0}\frac{f(x)}{x}=-b$.（6分）

再对式子 (1) 的两边在 $[0,1]$ 上作定积分，得

$$b=\int_0^1x^3dx+a\int_0^1x^2dx-b\int_0^1dx=\frac{1}{4}+\frac{a}{3}-\frac{b}{2}.$$（10分）

与 $a=-b$ 联立解得 $a=-\dfrac{3}{22},b=\dfrac{3}{22}$，所以

$$f(x)=x^3-\frac{3}{22}x^2-\frac{3}{22}x,\quad-\infty<x<+\infty.$$（14分）

## 2025 第十七届CMC预赛 非数学A类 解答三
类型: 解答
知识点: 一阶微分方程, Bernoulli方程
难度: 3
分值: 14
题目: （本题 14 分）求微分方程 $y'x\ln x\sin y+(1-x\cos y)\cos y=0$ 的通解。
答案: $\dfrac{1}{\cos y}=\dfrac{1}{\ln x}(x+C)$
解析:
将原方程变形为

$$y'\sin y+\frac{1}{x\ln x}\cos y=\frac{1}{\ln x}\cos^2y.\tag{1}$$

令 $z=\cos y$，则上述方程可化为 $n=2$ 的 Bernoulli 方程

$$z'-\frac{1}{x\ln x}z=-\frac{1}{\ln x}z^2.$$（6分）

令 $u=z^{-1}$，原方程可进一步化为非齐次线性方程

$$u'+\frac{1}{x\ln x}u=\frac{1}{\ln x}.$$

利用公式，得上述方程的通解为

$$u=e^{-\int\frac{dx}{x\ln x}}\left(\int\frac{1}{\ln x}e^{\int\frac{dx}{x\ln x}}dx+C\right)=\frac{1}{\ln x}(x+C).$$（12分）

将其中的变量换回原变量：$u=z^{-1}=\dfrac{1}{\cos y}$，得所求通解为

$$\frac{1}{\cos y}=\frac{1}{\ln x}(x+C).$$（14分）

## 2025 第十七届CMC预赛 非数学A类 解答四
类型: 解答
知识点: 三重积分, 先二后一法
难度: 4
分值: 14
题目: （本题 14 分）设 $\Omega$ 是由平面 $\Pi_1:x=0$，$\Pi_2:x=y$，$\Pi_3:y=z$，$\Pi_4:z=1$，$\Pi_5:z=2$ 围成的空间区域，求三重积分 $\displaystyle\iiint_\Omega\frac{dxdydz}{\sqrt{y^2+z^2}}$。
答案: $\dfrac{3(\sqrt{2}-1)}{2}$
解析:
采用先二后一法。设 $1\leqslant z\leqslant2$，用平面 $z=z$ 截 $\Omega$ 得平面区域：$D_z=\{(x,y)\,|\,0\leqslant x\leqslant z,0\leqslant y\leqslant x\}$，则

$$\iiint_\Omega\frac{dxdydz}{\sqrt{y^2+z^2}}=\int_1^2dz\iint_{D_z}\frac{dxdy}{\sqrt{y^2+z^2}}.$$（5分）

$$=\int_1^2dz\int_0^zdy\int_0^y\frac{dx}{\sqrt{y^2+z^2}}=\int_1^2dz\int_0^z\frac{y}{\sqrt{y^2+z^2}}dy$$（10分）

$$=\int_1^2\left.\sqrt{y^2+z^2}\right|_0^zdz=(\sqrt{2}-1)\int_1^2zdz=\frac{3(\sqrt{2}-1)}{2}.$$（14分）

## 2025 第十七届CMC预赛 非数学A类 解答五
类型: 解答
知识点: 级数收敛, 函数最值, 放缩
难度: 5
分值: 14
题目: （本题 14 分）判断级数 $\displaystyle\sum_{n=1}^{\infty}a_n$ 的收敛性，其中 $a_n=\sin^2x\sin^22x\ldots\sin^22^nx$，$x\in(-\infty,+\infty)$。
答案: 收敛
解析:
(1) 令 $f(x)=\sin^2x\sin2x$，则

$$f'(x)=2\sin^2x\left(3-4\sin^2x\right)=-8\sin^2x\left(\sin x-\frac{\sqrt{3}}{2}\right)\left(\sin x+\frac{\sqrt{3}}{2}\right).$$

令 $f(x)=0$，在 $(0,\pi)$ 中得到两个根 $x_1=\dfrac{\pi}{3},x_2=\dfrac{2\pi}{3}$。

容易证明函数 $f(x)$ 在 $\left(0,\dfrac{\pi}{3}\right)\cup\left(\dfrac{2\pi}{3},\pi\right)$ 上单调增加，在 $\left(\dfrac{\pi}{3},\dfrac{2\pi}{3}\right)$ 上单调减少.（4分）

(2) 由于 $f(x)$ 的周期为 $\pi$，$f(0)=f(\pi)=0$，$f(x)$ 在 $[0,\pi]$ 上的最大值和最小值分别为 $f\left(\dfrac{\pi}{3}\right)=\dfrac{3\sqrt{3}}{8}$ 和 $f\left(\dfrac{2\pi}{3}\right)=-\dfrac{3\sqrt{3}}{8}$。故 $\left|f(x)\right|\leqslant\dfrac{3\sqrt{3}}{8}$.（9分）

最后，由

$$a_n^{3/2}=|\sin x|\cdot\left|f(x)f(2x)\cdots f(2^{n-1}x)\right|\cdot\left|\sin^22^nx\right|\leqslant\left(\frac{3\sqrt{3}}{8}\right)^n,$$

知 $a_n\leqslant\left(\dfrac{3\sqrt{3}}{8}\right)^{\frac{2n}{3}}=\left(\dfrac{3}{4}\right)^n$。从而级数 $\displaystyle\sum_{n=1}^{\infty}a_n$ 收敛.（14分）

## 2025 第十七届CMC预赛 非数学A类 解答六
类型: 解答
知识点: 分部积分, 二重积分, 单调性, 积分不等式
难度: 5
分值: 14
题目: （本题 14 分）设函数 $f(x),g(x)$ 在 $[a,b]$ 上连续可导且满足以下三个条件：(i) $\displaystyle\int_a^bf(x)dx=\int_a^bg(x)dx=0$；(ii) $f'(x)g(x)-f(x)g'(x)>0$，$x\in[a,b]$；(iii) $g(x)$ 在 $(a,b)$ 上有唯一零点 $\xi$。证明：(1) $\displaystyle\int_a^bf(x)\left(\int_a^xg(s)ds\right)dx=-\int_a^bg(x)\left(\int_a^xf(s)ds\right)dx$；(2) $\displaystyle\int_a^bf(x)\left(\int_a^xg(s)ds\right)dx>0$。
答案: 见结论：(1) $\displaystyle\int_a^bf(x)\left(\int_a^xg(s)ds\right)dx=-\int_a^bg(x)\left(\int_a^xf(s)ds\right)dx$；\ \ (2) $\displaystyle\int_a^bf(x)\left(\int_a^xg(s)ds\right)dx>0$。记 $F=\int_a^xf$、$G=\int_a^xg$，由 $F(b)=G(b)=0$ 分部积分得 (1)；(2) 用 $f/g$ 在 $[a,\xi)$、$(\xi,b]$ 严格递增。
解析:
证明. (1) 记 $F(x)=\displaystyle\int_a^xf(s)ds,G(x)=\int_a^xg(s)ds$，则由分部积分

$$\int_a^bf(x)G(x)dx=\int_a^bG(x)dF(x)=-\int_a^bF(x)g(x)dx,$$

这里，用到了条件 $F(b)=G(b)=0$.（4分）

(2) 显然，$g'(\xi)\neq0$，不妨设 $g'(\xi)>0$，则在 $[a,\xi]$ 上 $g(x)<0$，在 $(\xi,b]$ 上 $g(x)>0$.

$$\int_a^bf(x)\left(\int_a^xg(s)ds\right)dx=\frac{1}{2}\iint_D\left(f(x)g(s)-f(s)g(x)\right)dxds,$$（8分）

其中，$D=\{(x,s)\,|\,a\leqslant s\leqslant x\leqslant b\}$.

把 $D$ 分成三部分：$D=D_1\cup D_2\cup D_3$，其中，$D_1=\{(x,s)\,|\,a\leqslant s\leqslant x\leqslant\xi\}$，$D_2=\{(x,s)\,|\,a\leqslant s\leqslant\xi\leqslant x\leqslant b\}$，$D_3=\{(x,s)\,|\,\xi\leqslant s\leqslant x\leqslant b\}$.

由条件 $f'(x)g(x)-f(x)g'(x)>0$ 知 $\dfrac{f(x)}{g(x)}$ 在 $[a,\xi)$ 和 $(\xi,b]$ 上严格单调递增，从而在 $D_1$ 和 $D_3$ 上，$f(x)g(s)-f(s)g(x)\geqslant0$ 且不恒等于 0，故

$$\iint_{D_1\cup D_3}\left(f(x)g(s)-f(s)g(x)\right)dxds>0.$$（12分）

又

$$\iint_{D_2}\left(f(x)g(s)-f(s)g(x)\right)dxds=\int_\xi^bf(x)dx\int_a^\xi g(s)ds-\int_\xi^bg(x)dx\int_a^\xi f(s)ds=0,$$

最后一个等式用到了 $\displaystyle\int_\xi^bf(x)dx=-\int_a^\xi f(s)ds$，$\displaystyle\int_\xi^bg(x)dx=-\int_a^\xi g(s)ds$.

综上，$\displaystyle\int_a^bf(x)\left(\int_a^xg(s)ds\right)dx>0$.（14分）
