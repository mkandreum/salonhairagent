// Tests for CTO agent scaffold
describe('CTO Agent Scaffold', () => {
  test('runAgent exports a function and returns a plan', async () => {
    const mod = await import('../src/index.js');
    const { runAgent } = mod;
    const res = await runAgent({ objective: 'Test automation' });
    expect(res).toBeTruthy();
    expect(res).toHaveProperty('plan');
    expect(Array.isArray(res.plan)).toBe(true);
  });

  test('plan contains steps with numeric order', async () => {
    const mod = await import('../src/index.js');
    const { runAgent } = mod;
    const res = await runAgent({ objective: 'Check plan contents' });
    expect(res.plan[0]).toHaveProperty('step');
    expect(typeof res.plan[0].step).toBe('number');
  });
});
