import type { FormulaGroup } from '../types';

/**
 * 核心公式定理速查手册
 *
 * 迁移自旧版应用，覆盖 12 个模块。渲染走 KaTeX，离线可用。
 */

export const FORMULA_BOOK: FormulaGroup[] = [
  {
    domain: '极限与连续',
    items: [
      {
        name: '两个重要极限',
        tex: '\\lim_{x\\to 0}\\frac{\\sin x}{x}=1,\\qquad \\lim_{x\\to\\infty}\\left(1+\\frac1x\\right)^x=e',
      },
      {
        name: '常用等价无穷小（x→0）',
        tex: '\\sin x\\sim x,\\ \\tan x\\sim x,\\ \\arcsin x\\sim x,\\ \\ln(1+x)\\sim x,\\ e^x-1\\sim x,\\ 1-\\cos x\\sim\\frac{x^2}{2},\\ (1+x)^\\alpha-1\\sim\\alpha x',
      },
      {
        name: '泰勒展开（x→0）',
        tex: 'e^x=\\sum_{n=0}^{\\infty}\\frac{x^n}{n!},\\quad \\ln(1+x)=\\sum_{n=1}^{\\infty}(-1)^{n-1}\\frac{x^n}{n},\\quad \\sin x=\\sum_{n=0}^{\\infty}(-1)^n\\frac{x^{2n+1}}{(2n+1)!}',
      },
      {
        name: '洛必达法则',
        tex: "\\lim\\frac{f}{g}\\text{ 为 }\\frac00\\text{ 或 }\\frac{\\infty}{\\infty}\\text{ 型时，}\\lim\\frac fg=\\lim\\frac{f'}{g'}",
      },
      {
        name: '单调有界准则',
        tex: '\\text{单调递增且有上界}\\Rightarrow\\text{收敛；单调递减且有下界}\\Rightarrow\\text{收敛}',
      },
    ],
  },
  {
    domain: '导数与微分',
    items: [
      {
        name: '导数定义',
        tex: "f'(x_0)=\\lim_{h\\to 0}\\frac{f(x_0+h)-f(x_0)}{h}",
      },
      {
        name: '参数方程求导',
        tex: "\\frac{dy}{dx}=\\frac{y'(t)}{x'(t)},\\qquad \\frac{d^2y}{dx^2}=\\frac{y''(t)x'(t)-y'(t)x''(t)}{[x'(t)]^3}",
      },
      {
        name: '反三角函数导数',
        tex: "(\\arcsin x)'=\\frac1{\\sqrt{1-x^2}},\\quad (\\arctan x)'=\\frac1{1+x^2},\\quad (\\operatorname{arccot}x)'=-\\frac1{1+x^2}",
      },
      {
        name: '莱布尼茨公式',
        tex: '(uv)^{(n)}=\\sum_{k=0}^{n}\\binom{n}{k}u^{(k)}v^{(n-k)}',
      },
    ],
  },
  {
    domain: '中值定理与性质',
    items: [
      {
        name: '拉格朗日中值定理',
        tex: "f(b)-f(a)=f'(\\xi)(b-a),\\quad \\xi\\in(a,b)",
      },
      {
        name: '柯西中值定理',
        tex: "\\frac{f(b)-f(a)}{g(b)-g(a)}=\\frac{f'(\\xi)}{g'(\\xi)},\\quad \\xi\\in(a,b)",
      },
      {
        name: '泰勒中值定理（拉格朗日余项）',
        tex: 'f(x)=\\sum_{k=0}^{n}\\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k+\\frac{f^{(n+1)}(\\xi)}{(n+1)!}(x-x_0)^{n+1}',
      },
      {
        name: '罗尔定理',
        tex: "f(a)=f(b),\\ f\\in C[a,b]\\cap D(a,b)\\Rightarrow \\exists\\xi,\\ f'(\\xi)=0",
      },
    ],
  },
  {
    domain: '不定积分',
    items: [
      {
        name: '分部积分',
        tex: '\\int u\\,dv=uv-\\int v\\,du',
      },
      {
        name: '基本公式',
        tex: '\\int\\frac{dx}{x}=\\ln|x|+C,\\quad \\int\\frac{dx}{1+x^2}=\\arctan x+C,\\quad \\int\\frac{dx}{\\sqrt{1-x^2}}=\\arcsin x+C',
      },
      {
        name: '有理函数拆分',
        tex: '\\frac{P(x)}{Q(x)}\\text{ 先化为多项式 + 部分分式，再逐项积分}',
      },
    ],
  },
  {
    domain: '定积分与反常积分',
    items: [
      {
        name: '牛顿—莱布尼茨公式',
        tex: '\\int_a^b f(x)\\,dx=F(b)-F(a)',
      },
      {
        name: '华里士公式（点火公式）',
        tex: '\\int_0^{\\pi/2}\\sin^n x\\,dx=\\int_0^{\\pi/2}\\cos^n x\\,dx=\\begin{cases}\\frac{(n-1)!!}{n!!}\\cdot\\frac\\pi2,& n\\text{ 偶}\\\\ \\frac{(n-1)!!}{n!!},& n\\text{ 奇}\\end{cases}',
      },
      {
        name: '奇偶性与周期性',
        tex: '\\int_{-a}^{a}f=\\begin{cases}0,& f\\text{ 奇}\\\\ 2\\int_0^a f,& f\\text{ 偶}\\end{cases},\\quad \\int_a^{a+T}f=\\int_0^T f',
      },
      {
        name: '反常积分收敛判别',
        tex: '\\int_1^{\\infty}\\frac{dx}{x^p}\\text{ 收敛}\\iff p>1;\\quad \\int_0^1\\frac{dx}{x^p}\\text{ 收敛}\\iff p<1',
      },
    ],
  },
  {
    domain: '重积分与积分应用',
    items: [
      {
        name: '极坐标变换',
        tex: 'x=r\\cos\\theta,\\ y=r\\sin\\theta,\\ dxdy=r\\,dr\\,d\\theta',
      },
      {
        name: '球坐标变换',
        tex: 'x=r\\sin\\varphi\\cos\\theta,\\ y=r\\sin\\varphi\\sin\\theta,\\ z=r\\cos\\varphi,\\ dV=r^2\\sin\\varphi\\,dr\\,d\\varphi\\,d\\theta',
      },
      {
        name: '弧长与旋转体体积',
        tex: "L=\\int_a^b\\sqrt{1+y'^2}\\,dx,\\quad V=\\pi\\int_a^b y^2\\,dx",
      },
      {
        name: '平面图形面积（极坐标）',
        tex: 'S=\\frac12\\int_\\alpha^\\beta r^2(\\theta)\\,d\\theta',
      },
    ],
  },
  {
    domain: '多元微积分与几何',
    items: [
      {
        name: '全微分',
        tex: 'dz=\\frac{\\partial z}{\\partial x}dx+\\frac{\\partial z}{\\partial y}dy',
      },
      {
        name: '方向导数与梯度',
        tex: '\\frac{\\partial f}{\\partial \\vec l}=\\nabla f\\cdot\\vec e_l,\\quad \\nabla f=\\left(\\frac{\\partial f}{\\partial x},\\frac{\\partial f}{\\partial y}\\right)',
      },
      {
        name: '切平面与法线',
        tex: 'F(x,y,z)=0:\\ \\nabla F(x_0,y_0,z_0)\\text{ 即法向量}',
      },
      {
        name: '二元极值判别',
        tex: 'AC-B^2>0\\text{ 且 }A>0\\Rightarrow\\text{极小};\\ AC-B^2>0,A<0\\Rightarrow\\text{极大};\\ AC-B^2<0\\Rightarrow\\text{非极值}',
      },
      {
        name: '拉格朗日乘数法',
        tex: '\\nabla f=\\lambda\\nabla g,\\quad g(x,y)=0',
      },
    ],
  },
  {
    domain: '微分方程',
    items: [
      {
        name: '一阶线性方程通解',
        tex: "y'+P(x)y=Q(x)\\Rightarrow y=e^{-\\int P dx}\\left(\\int Q e^{\\int P dx}dx+C\\right)",
      },
      {
        name: '伯努利方程',
        tex: "y'+P(x)y=Q(x)y^n\\ \\Rightarrow\\ z=y^{1-n}\\text{ 化为一阶线性}",
      },
      {
        name: '二阶常系数齐次',
        tex: "y''+py'+qy=0,\\ \\lambda^2+p\\lambda+q=0\\text{ 两实根}\\Rightarrow y=C_1e^{\\lambda_1x}+C_2e^{\\lambda_2x}",
      },
      {
        name: '可降阶类型',
        tex: "y''=f(x,y')\\text{ 令 }p=y';\\quad y''=f(y,y')\\text{ 令 }p=y',\\ y''=p\\frac{dp}{dy}",
      },
    ],
  },
  {
    domain: '无穷级数',
    items: [
      {
        name: '比值与根值判别',
        tex: '\\lim\\left|\\frac{a_{n+1}}{a_n}\\right|=\\rho<1\\Rightarrow\\text{绝对收敛};\\ \\rho>1\\Rightarrow\\text{发散}',
      },
      {
        name: '莱布尼茨判别法',
        tex: '\\sum(-1)^n a_n,\\ a_n\\downarrow 0\\Rightarrow\\text{收敛}',
      },
      {
        name: '幂级数收敛半径',
        tex: 'R=\\lim_{n\\to\\infty}\\left|\\frac{a_n}{a_{n+1}}\\right|',
      },
      {
        name: 'p 级数与几何级数',
        tex: '\\sum\\frac1{n^p}\\text{ 收敛}\\iff p>1;\\quad \\sum q^n\\text{ 收敛}\\iff|q|<1',
      },
    ],
  },
  {
    domain: '不等式',
    items: [
      {
        name: '均值不等式',
        tex: '\\frac{a_1+\\cdots+a_n}{n}\\geq\\sqrt[n]{a_1\\cdots a_n}\\quad (a_i>0)',
      },
      {
        name: '柯西不等式',
        tex: '\\left(\\sum a_ib_i\\right)^2\\leq\\left(\\sum a_i^2\\right)\\left(\\sum b_i^2\\right)',
      },
      {
        name: '琴生不等式',
        tex: 'f\\text{ 凸}\\Rightarrow f\\left(\\frac{\\sum x_i}{n}\\right)\\leq\\frac{\\sum f(x_i)}{n}',
      },
      {
        name: '积分形式柯西不等式',
        tex: '\\left(\\int_a^b fg\\right)^2\\leq\\int_a^b f^2\\cdot\\int_a^b g^2',
      },
    ],
  },
  {
    domain: '函数性质',
    items: [
      {
        name: '单调性与凹凸性',
        tex: "f'>0\\Rightarrow\\text{递增};\\ f''>0\\Rightarrow\\text{凹（下凸）}",
      },
      {
        name: '斜渐近线',
        tex: 'k=\\lim_{x\\to\\infty}\\frac{f(x)}{x},\\quad b=\\lim_{x\\to\\infty}[f(x)-kx]',
      },
    ],
  },
];

export const FORMULA_COUNT = FORMULA_BOOK.reduce((s, g) => s + g.items.length, 0);
