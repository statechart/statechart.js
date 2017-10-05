<scxml version="1.0">
  <state id="s0">
    <onentry>
      <raise event="foo"/>
    </onentry>

    <transition event="foo" cond={ ({ _event }) => _event.name == 'foo' } target="pass"/>
    <transition event="foo" target="fail"/>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
