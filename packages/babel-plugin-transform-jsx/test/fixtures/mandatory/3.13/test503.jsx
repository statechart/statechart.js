<scxml initial="s1" version="1.0">
  <datamodel>
    <data id="Var1" expr={ 0 }/>
    <data id="Var2" expr={ 0 }/>
  </datamodel>

  <state id="s1">
    <onentry>
      <raise event="foo"/>
      <raise event="bar"/>
    </onentry>
    <transition target="s2"/>
  </state>

  <state id="s2">
    <onexit>
      <assign location="Var1" expr={ ({ Var1 }) => Var1 + 1 }/>
    </onexit>
    <transition event="foo">
      <assign location="Var2" expr={ ({ Var2 }) => Var2 + 1 }/>
    </transition>
    <transition event="bar" cond={ ({ Var2 }) => Var2 == 1 } target="s3"/>
    <transition event="bar" target="fail"/>
  </state>

  <state id="s3">
    <transition cond={ ({ Var1 }) => Var1 == 1 } target="pass"/>
    <transition target="fail"/>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>

</scxml>
