<scxml version="1.0" initial="s1">

  <state id="s1" initial="s11">
    <onentry>
      <send event="externalEvent"/>
      <raise event="internalEvent1"/>
      <raise event="internalEvent2"/>
      <raise event="internalEvent3"/>
      <raise event="internalEvent4"/>
    </onentry>

    <transition event="externalEvent" target="fail"/>

    <state id="s11">
      <transition event="internalEvent3" target="s12"/>
    </state>

    <state id="s12">
      <transition event="internalEvent4" target="pass"/>
    </state>

  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
