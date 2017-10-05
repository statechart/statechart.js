<scxml initial="s0" version="1.0">

  <state id="s0">
    <onentry>
      <send event="externalEvent1"/>
      <send event="externalEvent2" delay={ () => '1s' }/>
      <raise event="internalEvent"/>
    </onentry>
    <transition event="internalEvent" target="s1"/>
    <transition event="*" target="fail"/>
  </state>

  <state id="s1">
    <transition event="externalEvent2" target="pass"/>
    <transition event="internalEvent" target="fail"/>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>

</scxml>
