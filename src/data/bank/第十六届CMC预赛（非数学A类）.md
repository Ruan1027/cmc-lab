## 2024 第十六届CMC预赛 非数学A类 填空1
类型: 填空
知识点: 定积分, 分部积分
难度: 2
分值: 5
题目: $\displaystyle\int_0^1\ln(1+x^2)dx=$ ＿＿＿
答案: ln(2)-2+pi/2
解析:
$$\int\ln(1+x^2)dx=x\ln(1+x^2)-\int\frac{2x^2}{1+x^2}dx=x\ln(1+x^2)-2x+2\arctan x+C.$$

故原式等于 $\ln 2-2+\dfrac{\pi}{2}$。

## 2024 第十六届CMC预赛 非数学A类 填空2
类型: 填空
知识点: 二重积分, 极坐标, 等价无穷小
难度: 3
分值: 5
题目: 设 $D:x^2+y^2\leqslant r^2$，其中 $r>0$。则 $\displaystyle\lim_{r\to0^+}\frac{\iint_D\left(e^{x^2+y^2}-1\right)dxdy}{r^4}=$ ＿＿＿
答案: pi/2
解析:
利用极坐标变换 $x=\rho\cos\theta,y=\rho\sin\theta$，则

$$\iint_D\left(e^{x^2+y^2}-1\right)dxdy=2\pi\int_0^r\left(e^{\rho^2}-1\right)\rho\,d\rho=\pi\left(e^{r^2}-1-r^2\right).$$

注意，$r\to0^+$ 时，$e^{r^2}-1-r^2=\dfrac{r^4}{2}+o(r^4)$，故原式 $=\dfrac{\pi}{2}$。

## 2024 第十六届CMC预赛 非数学A类 填空3
类型: 解答
知识点: 多元复合函数, 二阶混合偏导数
难度: 4
分值: 14
题目: 已知函数 $z=f(xy,e^{x+y})$，且 $f(x,y)$ 具有二阶连续偏导数。则 $\dfrac{\partial^2z}{\partial x\partial y}=$
答案: 见结论：$\displaystyle z_{xy}=xyf_{11}+(x+y)e^{x+y}f_{12}+e^{2(x+y)}f_{22}+f_1+e^{x+y}f_2$（$f_1=\dfrac{\partial f}{\xi}$）。
解析:
$$z_x=yf_1+e^{x+y}f_2,$$

$$z_{xy}=(xf_{11}+e^{x+y}f_{12})y+f_1+(xf_{21}+e^{x+y}f_{22})e^{x+y}+e^{x+y}f_2$$

$$=xyf_{11}+(x+y)e^{x+y}f_{12}+e^{2(x+y)}f_{22}+f_1+e^{x+y}f_2.$$

## 2024 第十六届CMC预赛 非数学A类 填空4
类型: 解答
知识点: 解析几何, 平面束, 投影直线, 方向向量
难度: 4
分值: 14
题目: 直线 $L:\dfrac{x-1}{1}=\dfrac{y}{1}=\dfrac{z-1}{-1}$ 在平面 $\pi:x-y+2z-1=0$ 上的投影直线 $L_0$ 的单位方向向量为
答案: 见结论：$\left(-\dfrac4{\sqrt{21}},-\dfrac2{\sqrt{21}},\dfrac1{\sqrt{21}}\right)$。
解析:
直线 $L$ 的一般式方程为 $\begin{cases}x-y-1=0\\ y+z-1=0\end{cases}$，这样，过 $L$ 的平面束方程为

$$x-y-1+\lambda(y+z-1)=0,\quad\text{即}\quad x+(\lambda-1)y+\lambda z-1-\lambda=0,$$

其中 $\lambda$ 为参数。平面的法向量为 $(1,\lambda-1,\lambda)$。

此法向量与平面 $\pi$ 的法向量垂直当且仅当 $(1,\lambda-1,\lambda)\cdot(1,-1,2)=0$，即 $\lambda=-2$。

从而，过 $L$ 且与平面 $\pi$ 垂直的平面为 $x-3y-2z+1=0$。于是，投影直线 $L_0$ 的方程为 $\begin{cases}x-3y-2z+1=0\\ x-y+2z-1=0\end{cases}$。

由此，$L_0$ 的方向向量为 $(-4,-2,1)$。故单位方向向量为 $\pm\left(-\dfrac{4}{\sqrt{21}},-\dfrac{2}{\sqrt{21}},\dfrac{1}{\sqrt{21}}\right)$。

注：单位方向向量有两个，得到一个即可。

## 2024 第十六届CMC预赛 非数学A类 填空5
类型: 填空
知识点: 第二型曲线积分, Green公式, 挖洞法
难度: 5
分值: 5
题目: 设 $L$ 为圆周 $x^2+y^2=9$，取逆时针方向，则第二型曲线积分 $\displaystyle\int_L\frac{-y}{4x^2+y^2}dx+\frac{x}{4x^2+y^2}dy=$ ＿＿＿
答案: pi
解析:
记 $P=\dfrac{-y}{4x^2+y^2},Q=\dfrac{x}{4x^2+y^2}$，$L_1:4x^2+y^2=4$，取顺时针方向。

在 $L$ 与 $L_1$ 所围成的环状区域内 $P,Q$ 都是连续可微的且 $Q_x-P_y\equiv0$。根据 Green 公式，

$$\int_{L+L_1}Pdx+Qdy=0.$$

故

$$\int_LPdx+Qdy=\int_{-L_1}Pdx+Qdy=\frac{1}{4}\int_{-L_1}-ydx+xdy.$$

再由 Green 公式，

$$\frac{1}{4}\int_{-L_1}-ydx+xdy=\frac{1}{4}\iint_D2dxdy=\frac{1}{2}\sigma(D)=\pi,$$

其中 $D:4x^2+y^2\leq4$，$\sigma(D)=2\pi$ 为 $D$ 的面积。

## 2024 第十六届CMC预赛 非数学A类 解答二
类型: 解答
知识点: 一阶微分方程, 线性方程, 全微分方程
难度: 5
分值: 14
题目: （本题 14 分）求微分方程 $\left(x^3-y^2\right)dx+\left(x^2y+xy\right)dy=0$ 的通解。
答案: $(1+x)\sqrt{x^2+y^2}=Cx$
解析:
解法 1. 设 $u=y^2$，则原方程化为 $\dfrac{du}{dx}=\dfrac{2u}{x(1+x)}-\dfrac{2x^2}{x+1}$.（6分）

这个线性方程的通解为

$$\left(\frac{1+x}{x}\right)^2u+(1+x)^2=C.$$

即

$$\left(\frac{1+x}{x}\right)^2y^2+(1+x)^2=C.$$（14分）

解法 2. 原方程可化为

$$xdx+ydy+y\frac{xdy-ydx}{x^2}=0,$$

即

$$\frac{1}{2}d(x^2+y^2)+yd\left(\frac{y}{x}\right)=0.$$（6分）

两边同除以 $\sqrt{x^2+y^2}$，得

$$\frac{1}{2}\frac{d(x^2+y^2)}{\sqrt{x^2+y^2}}+\frac{1}{\sqrt{1+\left(\frac{y}{x}\right)^2}}\cdot\frac{y}{x}\cdot d\left(\frac{y}{x}\right)=0,$$

即

$$d\left(\sqrt{x^2+y^2}\right)+d\left(\sqrt{1+\left(\frac{y}{x}\right)^2}\right)=0.$$

故

$$\sqrt{x^2+y^2}+\frac{\sqrt{x^2+y^2}}{x}=C,$$

即

$$(1+x)\sqrt{x^2+y^2}=Cx.$$（14分）

解法 3. 将原方程化为 $xdx+ydy+y\dfrac{xdy-ydx}{x^2}=0$，即

$$\frac{1}{2}d(x^2+y^2)+yd\left(\frac{y}{x}\right)=0.$$（6分）

令 $x=r\cos\theta,y=r\sin\theta$，则 $r=\sqrt{x^2+y^2},\tan\theta=\dfrac{y}{x}$，方程化为

$$\frac{1}{2}dr^2+r\sin\theta d\tan\theta=0,$$

$$dr+\sec\theta\tan\theta d\theta=0.$$

积分得，$r+\sec\theta=C$。

换回原变量，得原方程的通解为

$$\sqrt{x^2+y^2}+\frac{\sqrt{x^2+y^2}}{x}=C.$$（14分）

## 2024 第十六届CMC预赛 非数学A类 解答三
类型: 解答
知识点: 函数连续性, 洛必达法则, 最值, 单调性
难度: 5
分值: 14
题目: （本题 14 分）设函数 $f(x)=\begin{cases}\dfrac{1}{\ln(1+x)}-\dfrac{1}{x},&0<x\leqslant1,\\ k,&x=0.\end{cases}$ (1) 求常数 $k$ 的值，使得 $f(x)$ 在区间 $[0,1]$ 上连续；(2) 对 (1) 中 $k$ 的值，求函数 $f(x)$ 的最小值 $\lambda$ 与最大值 $\mu$。
答案: $k=\dfrac{1}{2}$；$\lambda=\dfrac{1}{\ln2}-1$，$\mu=\dfrac{1}{2}$
解析:
(1)

$$\lim_{x\to0^+}f(x)=\lim_{x\to0^+}\frac{x-\ln(1+x)}{x\ln(1+x)}=\lim_{x\to0^+}\frac{x-\ln(1+x)}{x^2}$$

$$=\lim_{x\to0^+}\frac{1-\dfrac{1}{1+x}}{2x}=\lim_{x\to0^+}\frac{1}{2(1+x)}=\frac{1}{2}.$$

令 $k=\dfrac{1}{2}$，则 $\displaystyle\lim_{x\to0^+}f(x)=f(0)=\frac{1}{2}$，所以 $f(x)$ 在 $[0,1]$ 上连续.（4分）

(2) 易知 $f(x)$ 在 $(0,1)$ 内可导，且

$$f'(x)=-\frac{1}{(1+x)\ln^2(1+x)}+\frac{1}{x^2}=\frac{g(x)}{x^2(1+x)\ln^2(1+x)},$$

其中 $g(x)=(1+x)\ln^2(1+x)-x^2$.（8分）

因为 $g'(x)=\ln^2(1+x)+2\ln(1+x)-2x$，且

$$g''(x)=\frac{2\ln(1+x)}{1+x}+\frac{2}{1+x}-2=\frac{2\ln(1+x)-2x}{1+x}<0\quad(0<x\leqslant1),$$

所以 $g'(x)$ 在 $[0,1]$ 上单调递减，故当 $0<x\leqslant1$ 时，$g'(x)<g'(0)=0$。这又推出 $g(x)$ 在 $[0,1]$ 上单调递减，故当 $0<x\leqslant1$ 时，$g(x)<g(0)=0$。从而 $f'(x)<0$（$0<x\leqslant1$），又可推出 $f(x)$ 在 $[0,1]$ 上单调递减。因此，

$$\min_{0\leqslant x\leqslant1}f(x)=f(1)=\frac{1}{\ln2}-1,\qquad\max_{0\leqslant x\leqslant1}f(x)=f(0)=\frac{1}{2}.$$

于是，函数 $f(x)$ 的最小值 $\lambda=\dfrac{1}{\ln2}-1$，最大值 $\mu=\dfrac{1}{2}$.（14分）

## 2024 第十六届CMC预赛 非数学A类 解答四
类型: 解答
知识点: 第二型曲面积分, Gauss公式, 球坐标
难度: 5
分值: 14
题目: （本题 14 分）求曲面积分 $I=\displaystyle\iint_S\left(x^2-x\right)dydz+\left(y^2-y\right)dzdx+\left(z^2-z\right)dxdy$，其中 $S$ 是上半球面 $x^2+y^2+z^2=R^2$（$z\geqslant0$）的上侧。
答案: $\dfrac{\pi R^4}{2}-2\pi R^3$
解析:
解法 1. 记 $\Sigma=\{(x,y,z)\,|\,z=0,x^2+y^2\leqslant R^2\}$，取下侧。由 Gauss 公式知

$$\iint_{S+\Sigma}\left(x^2-x\right)dydz+\left(y^2-y\right)dzdx+\left(z^2-z\right)dxdy=\iiint_\Omega\left(2(x+y+z)-3\right)dxdydz,$$

其中，$\Omega=\{(x,y,z)\,|\,z\geqslant0,x^2+y^2+z^2\leqslant R^2\}$.（4分）

由于

$$\iint_\Sigma\left(x^2-x\right)dydz+\left(y^2-y\right)dzdx+\left(z^2-z\right)dxdy=0,$$

所以

$$I=\iiint_\Omega\left(2(x+y+z)-3\right)dxdydz.$$（8分）

由对称性，

$$I=\iiint_\Omega(2z-3)dxdydz.$$

用球坐标变换 $x=r\cos\theta\sin\varphi,\ y=r\sin\theta\sin\varphi,\ z=r\cos\varphi$，得

$$I=\int_0^{2\pi}d\theta\int_0^{\frac{\pi}{2}}d\varphi\int_0^R\left(2r\cos\varphi-3\right)r^2\sin\varphi dr=2\pi\left(\frac{R^4}{4}-R^3\right).$$（14分）

注：最后一步直接利用直角坐标计算也可以。

解法 2. $S$ 的参数方程为

$$x=R\cos\theta\sin\varphi,\ y=R\sin\theta\sin\varphi,\ z=R\cos\varphi,\ \left(0\leqslant\varphi\leqslant\frac{\pi}{2},0\leqslant\theta\leqslant2\pi\right).$$

曲面 $S$ 上的点 $(x,y,z)$ 处的单位法向为 $\dfrac{(x,y,z)}{R}$，故

$$I=\iint_S\left(x^2-x,y^2-y,z^2-z\right)\cdot\frac{(x,y,z)}{R}dS$$

$$=\frac{1}{R}\iint_S\left[x^3+y^3+z^3-\left(x^2+y^2+z^2\right)\right]dS$$

$$=\frac{1}{R}\iint_S\left[x^3+y^3+z^3-R^2\right]dS.$$（6分）

由对称性可知

$$\iint_Sx^3dS=\iint_Sy^3dS=0.$$（8分）

故

$$I=\frac{1}{R}\iint_Sz^3dS-R\iint_SdS=\frac{1}{R}\iint_Sz^3dS-2\pi R^3$$

$$=\frac{1}{R}\iiint_{\substack{0\leqslant\varphi\leqslant\frac{\pi}{2}\\0\leqslant\theta\leqslant2\pi}}(R\cos\varphi)^3R^2\sin\varphi d\varphi d\theta-2\pi R^3$$

$$=2\pi R^4\int_0^{\frac{\pi}{2}}\cos^3\varphi\sin\varphi d\varphi-2\pi R^3$$

$$=2\pi R^4\cdot\frac{1}{4}-2\pi R^3$$

$$=\frac{\pi R^4}{2}-2\pi R^3.$$（14分）

## 2024 第十六届CMC预赛 非数学A类 解答五
类型: 解答
知识点: 积分估计, Lipschitz条件, 不等式证明
难度: 5
分值: 14
题目: （本题 14 分）设 $f(x)$ 是 $(-\infty,+\infty)$ 上具有连续导数的非负函数，且存在 $M>0$ 使得对任意的 $x,y\in(-\infty,+\infty)$，有 $|f'(x)-f'(y)|\leqslant M|x-y|$。证明：对于任意实数 $x$，恒有 $\left(f'(x)\right)^2\leqslant2Mf(x)$。
答案: 见结论：$\left(f'(x)\right)^2\le2Mf(x)$。由 $0\le f(x+h)=f(x)+\displaystyle\int_0^h\left(f'(x+t)-f'(x)\right)dt+f'(x)h$ 取 $hf'(x)\le0$，得 $|f'(x)|\le\dfrac{f(x)}{|h|}+M\dfrac{|h|}{2}$，再取 $|h|=\sqrt{\dfrac{2f(x)}{M}}$。
解析:
证明. 任取 $x\in(-\infty,+\infty)$，对任意 $h\in(-\infty,+\infty)$，且 $h\neq0$，恒有

$$0\leqslant f(x+h)=f(x)+\int_0^hf'(x+t)dt$$

$$=f(x)+\int_0^h\left(f'(x+t)-f'(x)\right)dt+f'(x)h.$$（6分）

取 $h$ 使得 $hf'(x)\leqslant0$，则

$$-f'(x)h\leqslant f(x)+\int_0^h\left(f'(x+t)-f'(x)\right)dt\leqslant f(x)+M\frac{h^2}{2},$$

$$|f'(x)|\leqslant\frac{f(x)}{|h|}+M\frac{|h|}{2}.$$（12分）

取 $|h|=\sqrt{\dfrac{2f(x)}{M}}$，即得所证不等式 $\left(f'(x)\right)^2\leqslant2Mf(x)$.（14分）

## 2024 第十六届CMC预赛 非数学A类 解答六
类型: 解答
知识点: 二重级数, 收敛证明, 积分估计, 部分和
难度: 5
分值: 14
题目: （本题 14 分）证明：级数 $\displaystyle\sum_{n=1}^{\infty}\sum_{k=1}^{\infty}\frac{(-1)^{\lfloor\sqrt{n}\rfloor}}{n^2+k^2}$ 收敛，其中 $[x]$ 表示不超过 $x$ 的最大整数。
答案: 见结论：级数收敛（绝对收敛）。原式化为 $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{\lfloor\sqrt n\rfloor}}{n}\arctan\frac1n$，而 $\sum\dfrac{(-1)^{\lfloor\sqrt n\rfloor}}n$ 由 $C_m\to0$ 且单调递减知收敛。
解析:
证明. 对于任意固定的 $n$ 和 $N$，有

$$\sum_{k=1}^{N}\frac{1}{k^2+n^2}\leqslant\sum_{k=1}^{N}\int_{k-1}^{k}\frac{1}{y^2+n^2}dy=\int_0^N\frac{1}{y^2+n^2}dy=\frac{1}{n}\arctan\frac{N}{n}.$$

$$\sum_{k=1}^{N}\frac{1}{k^2+n^2}\geqslant\sum_{k=1}^{N}\int_k^{k+1}\frac{1}{y^2+n^2}dy=\int_1^{N+1}\frac{1}{y^2+n^2}dy=\frac{1}{n}\left(\arctan\frac{N+1}{n}-\arctan\frac{1}{n}\right).$$

$$\left|\sum_{k=1}^{N}\frac{1}{k^2+n^2}-\frac{\pi}{2n}\right|\leqslant\frac{\pi}{2n}-\frac{1}{n}\left(\arctan\frac{N+1}{n}-\arctan\frac{1}{n}\right).$$

令 $N\to\infty$，即有

$$\left|\sum_{k=1}^{\infty}\frac{1}{k^2+n^2}-\frac{\pi}{2n}\right|\leqslant\frac{1}{n}\arctan\frac{1}{n}.$$（4分）

注意到

$$\sum_{n=1}^{\infty}\left|\sum_{k=1}^{\infty}\frac{(-1)^{\lfloor\sqrt{n}\rfloor}}{n^2+k^2}-\frac{\pi}{2}\cdot\frac{(-1)^{\lfloor\sqrt{n}\rfloor}}{n}\right|=\sum_{n=1}^{\infty}\left|\sum_{k=1}^{\infty}\frac{1}{k^2+n^2}-\frac{\pi}{2n}\right|\leqslant\sum_{n=1}^{\infty}\frac{1}{n}\arctan\frac{1}{n}<+\infty.$$

即 $\displaystyle\sum_{n=1}^{\infty}\left(\sum_{k=1}^{\infty}\frac{(-1)^{\lfloor\sqrt{n}\rfloor}}{n^2+k^2}-\frac{\pi}{2}\cdot\frac{(-1)^{\lfloor\sqrt{n}\rfloor}}{n}\right)$ 绝对收敛，从而收敛。由此，级数 $\displaystyle\sum_{n=1}^{\infty}\sum_{k=1}^{\infty}\frac{(-1)^{\lfloor\sqrt{n}\rfloor}}{n^2+k^2}$ 与级数 $\displaystyle\sum_{n=1}^{\infty}\frac{\pi}{2}\cdot\frac{(-1)^{\lfloor\sqrt{n}\rfloor}}{n}$ 同敛散。以下只需证级数 $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{\lfloor\sqrt{n}\rfloor}}{n}$ 收敛.（8分）

记 $S_n$ 为级数 $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{\lfloor\sqrt{n}\rfloor}}{n}$ 的前 $n$ 项部分和，则有

$$S_{n^2}=\sum_{m=1}^{n-1}\sum_{k=m^2}^{(m+1)^2-1}\frac{(-1)^{\lfloor\sqrt{k}\rfloor}}{k}+\frac{(-1)^n}{n^2}=\sum_{m=1}^{n-1}(-1)^mC_m+\frac{(-1)^n}{n^2},$$

其中

$$C_m=\sum_{k=m^2}^{(m+1)^2-1}\frac{1}{k}.$$

由 $C_m<m\cdot\frac{1}{m^2}+\frac{1}{m^2+m}\cdot(m+1)=\frac{2}{m}$ 知，$C_m\to0,m\to\infty$。

此外，$C_m>(m+1)\cdot\frac{1}{m^2+m}+\frac{1}{m^2+2m}\cdot m>\frac{2}{m+1}>C_{m+1}$，从而 $C_m$ 单调递减，级数 $\displaystyle\sum_{m=1}^{\infty}(-1)^mC_m$ 收敛，$S_{n^2}$ 收敛.（12分）

对于其它的 $N$，存在 $n$ 使得

$$n^2\leqslant N<(n+1)^2,\quad\left|S_N-S_{n^2}\right|\leqslant C_n<\frac{2}{n}\to0,N\to\infty.$$

故级数 $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{\lfloor\sqrt{n}\rfloor}}{n}$ 收敛，证毕.（14分）
