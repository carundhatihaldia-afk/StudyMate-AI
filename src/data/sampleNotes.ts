export interface SampleNote {
  id: string;
  category: string;
  title: string;
  badge: string;
  content: string;
}

export const SAMPLE_NOTES: SampleNote[] = [
  {
    id: 'bio-cells',
    category: 'Biology & Life Sciences',
    title: 'Cellular Respiration and ATP Synthesis',
    badge: 'Biology',
    content: `Cellular respiration is the biochemical process by which eukaryotic organisms convert biochemical energy from nutrients into adenosine triphosphate (ATP), and then release waste products. The overall chemical equation is:
C6H12O6 + 6O2 -> 6CO2 + 6H2O + ~30-32 ATP.

The process consists of three main stages:
1. Glycolysis:
- Takes place in the cytoplasm.
- Anaerobic process (does not require oxygen).
- Breaks down 1 glucose molecule (6 carbons) into 2 molecules of pyruvate (3 carbons each).
- Yields a net gain of 2 ATP and 2 NADH per glucose.

2. The Krebs Cycle (Citric Acid Cycle):
- Occurs in the mitochondrial matrix.
- Before entering, pyruvate undergoes oxidative decarboxylation to form Acetyl-CoA.
- Acetyl-CoA combines with oxaloacetate to form citrate.
- Each turn generates 1 ATP (or GTP), 3 NADH, 1 FADH2, and releases 2 CO2 molecules. Since there are 2 pyruvates per glucose, it turns twice per glucose.

3. Oxidative Phosphorylation (Electron Transport Chain & Chemiosmosis):
- Located on the inner mitochondrial membrane (cristae).
- High-energy electrons from NADH and FADH2 pass through transmembrane protein complexes (Complexes I-IV).
- This electron transport pumps H+ protons from the matrix into the intermembrane space, creating a steep electrochemical proton gradient.
- Chemiosmosis: Protons diffuse back into the matrix through ATP Synthase, rotating the catalytic head to phosphorylate ADP + Pi into ATP.
- Oxygen serves as the final electron acceptor, combining with electrons and protons to form water (H2O). Without oxygen, the ETC backs up and aerobic ATP production halts.

Key energetic efficiency:
Aerobic respiration generates up to 32 ATP per glucose, whereas anaerobic fermentation (lactic acid or alcoholic) only yields 2 net ATP via glycolysis.`
  },
  {
    id: 'history-ind-rev',
    category: 'World History',
    title: 'The Industrial Revolution & Socioeconomic Impact',
    badge: 'History',
    content: `The Industrial Revolution began in Great Britain during the mid-18th century (roughly 1760 to 1840) and transformed agrarian and handicraft economies into mechanized and factory-driven industrial systems.

Key Drivers & Inventions:
1. Steam Power: James Watt's improvements to the steam engine (1769-1776) drastically increased fuel efficiency, freeing factories from reliance on fast-flowing rivers for waterwheel power.
2. Textile Innovations: Inventions like James Hargreaves' Spinning Jenny (1764) and Richard Arkwright's Water Frame mechanized cotton thread spinning, leading to the creation of the modern factory system.
3. Abundant Natural Resources: Britain possessed extensive, accessible deposits of coal and iron ore, as well as a stable banking system, legal protections for patents, and a global merchant empire providing raw cotton and captive export markets.

Social and Economic Consequences:
- Urbanization: Rapid migration from rural farmlands to expanding manufacturing cities (such as Manchester, Birmingham, and Leeds). This sudden population density led to overcrowded tenements, lack of sewage systems, and outbreaks of cholera and typhus.
- Emergence of New Social Classes: The rise of the industrial bourgeoisie (factory and mine owners) and the industrial working proletariat.
- Labor Conditions: Factory workers endured 12-to-16 hour workdays, 6 days a week, in hazardous environments without workplace safety regulations. Child labor was pervasive in textile mills and coal mines due to their small stature and low wages.
- Policy and Reform: Worker discontent gave rise to the Luddite movement (machine-breaking protests), trade unions, and eventually legislative reforms such as the British Factory Act of 1833, which placed legal limits on child working hours.`
  },
  {
    id: 'cs-big-o',
    category: 'Computer Science',
    title: 'Sorting Algorithms and Big-O Time Complexity',
    badge: 'CompSci',
    content: `Big-O notation is an asymptotic mathematical notation used in computer science to classify algorithms according to how their run time or space requirements grow as the input size (n) scales toward infinity.

Core Complexity Orders (from fastest to slowest):
- O(1): Constant time (e.g., array index access, hash map lookup on average).
- O(log n): Logarithmic time (e.g., binary search on sorted array).
- O(n): Linear time (e.g., linear search, single pass through an array).
- O(n log n): Linearithmic time (e.g., Merge Sort, Heap Sort, optimal comparison sorts).
- O(n^2): Quadratic time (e.g., Bubble Sort, Insertion Sort, Selection Sort nested loops).
- O(2^n): Exponential time (e.g., recursive Fibonacci without memoization).

Major Sorting Algorithms Analysis:
1. Bubble Sort:
- Continuously swaps adjacent elements if they are in the wrong order.
- Time Complexity: Best O(n) when already sorted with flag, Average and Worst O(n^2).
- Space Complexity: O(1) in-place. Stable.

2. Merge Sort:
- Divide-and-conquer algorithm. Recursively splits array into halves, sorts each half, and merges the sorted sub-arrays.
- Time Complexity: O(n log n) in Best, Average, and Worst cases.
- Space Complexity: O(n) auxiliary memory for merge buffer. Stable.

3. Quick Sort:
- Selects a 'pivot' element, partitions the array such that elements smaller than pivot are on left and greater on right, then recursively sorts partitions.
- Time Complexity: Best and Average O(n log n); Worst O(n^2) when pivot is poorly chosen (e.g., smallest/largest in already sorted array).
- Space Complexity: O(log n) auxiliary stack space. Unstable by default.

Summary Rule:
Comparison-based sorting has a mathematical lower bound of Omega(n log n) comparisons in the worst case.`
  }
];
