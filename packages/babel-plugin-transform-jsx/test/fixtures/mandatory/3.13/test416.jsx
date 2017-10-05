<scxml version="1.0" initial="s1">

  <state id="s1" initial="s11">
    <onentry>
      <send event="timeout" delay="1s"/>
    </onentry>
    <transition event="timeout" target="fail"/>

    <state id="s11" initial="s111">
      <transition event="done.state.s11" target="pass"/>
      <state id="s111">
        <transition target="s11final"/>
      </state>
      <final id="s11final"/>
    </state>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>

</scxml>
