<scxml initial="s0" version="1.0">
  <datamodel>
    <data id="Var1" expr={ 0 }/>
  </datamodel>

  <state id="s0" initial="p0">
    <transition event="event1">
      <assign location="Var1" expr={ ({ Var1 }) => Var1 + 1 }/>
    </transition>

    <parallel id="p0">

      <onentry>
        <raise event="event1"/>
        <raise event="event2"/>
      </onentry>

      <transition event="event1">
        <assign location="Var1" expr={ ({ Var1 }) => Var1 + 1 }/>
      </transition>

      <state id="p0s1">
        <transition event="event2" cond={ ({ Var1 }) => Var1 == 1 } target="pass"/>
        <transition event="event2" target="fail"/>
      </state>

      <state id="p0s2"/>

    </parallel>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
